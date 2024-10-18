import { ObjectId } from "mongodb";

import { Router, getExpressRouter } from "./framework/router";

import { Authing, Friending, Joining, Posting, Sessioning, VerifyingIdentity, Endorsing, LocationSharing } from "./app";
import { NotFoundError } from "./concepts/errors";
import { PostOptions } from "./concepts/posting";
import { SessionDoc } from "./concepts/sessioning";
import { VerificationData } from "./concepts/verifying";
import Responses from "./responses";

import { z } from "zod";

/**
 * Web server routes for the app. Implements synchronizations between concepts.
 */
class Routes {
  // Synchronize the concepts from `app.ts`.

  @Router.get("/session")
  async getSessionUser(session: SessionDoc) {
    const user = Sessioning.getUser(session);
    return await Authing.getUserById(user);
  }

  @Router.get("/users")
  async getUsers() {
    return await Authing.getUsers();
  }

  @Router.get("/users/:username")
  @Router.validate(z.object({ username: z.string().min(1) }))
  async getUser(username: string) {
    return await Authing.getUserByUsername(username);
  }

  @Router.post("/users")
  async createUser(session: SessionDoc, username: string, password: string) {
    Sessioning.isLoggedOut(session);
    return await Authing.create(username, password);
  }

  @Router.patch("/users/username")
  async updateUsername(session: SessionDoc, username: string) {
    const user = Sessioning.getUser(session);
    return await Authing.updateUsername(user, username);
  }

  @Router.patch("/users/password")
  async updatePassword(session: SessionDoc, currentPassword: string, newPassword: string) {
    const user = Sessioning.getUser(session);
    return Authing.updatePassword(user, currentPassword, newPassword);
  }

  @Router.delete("/users")
  async deleteUser(session: SessionDoc) {
    const user = Sessioning.getUser(session);
    Sessioning.end(session);
    return await Authing.delete(user);
  }

  @Router.post("/login")
  async logIn(session: SessionDoc, username: string, password: string) {
    const u = await Authing.authenticate(username, password);
    Sessioning.start(session, u._id);
    return { msg: "Logged in!" };
  }

  @Router.post("/logout")
  async logOut(session: SessionDoc) {
    Sessioning.end(session);
    return { msg: "Logged out!" };
  }

  @Router.get("/posts")
  @Router.validate(z.object({ author: z.string().optional() }))
  async getPosts(author?: string) {
    let posts;
    if (author) {
      const id = (await Authing.getUserByUsername(author))._id;
      posts = await Posting.getByAuthor(id);
    } else {
      posts = await Posting.getPosts();
    }
    return Responses.posts(posts);
  }

  @Router.post("/posts")
  async createPost(session: SessionDoc, content: string, options?: PostOptions) {
    const user = Sessioning.getUser(session);
    // Ensure the user is verified before creating a post
    await VerifyingIdentity.assertUserVerified(user);
    const created = await Posting.create(user, content, options);
    return { msg: created.msg, post: await Responses.post(created.post) };
  }

  @Router.patch("/posts/:id")
  async updatePost(session: SessionDoc, id: string, content?: string, options?: PostOptions) {
    const user = Sessioning.getUser(session);
    const oid = new ObjectId(id);
    await Posting.assertAuthorIsUser(oid, user);
    return await Posting.update(oid, content, options);
  }

  @Router.delete("/posts/:id")
  async deletePost(session: SessionDoc, id: string) {
    const user = Sessioning.getUser(session);
    const oid = new ObjectId(id);
    await Posting.assertAuthorIsUser(oid, user);
    return Posting.delete(oid);
  }

  @Router.get("/friends")
  async getFriends(session: SessionDoc) {
    const user = Sessioning.getUser(session);
    return await Authing.idsToUsernames(await Friending.getFriends(user));
  }

  @Router.delete("/friends/:friend")
  async removeFriend(session: SessionDoc, friend: string) {
    const user = Sessioning.getUser(session);
    const friendOid = (await Authing.getUserByUsername(friend))._id;
    return await Friending.removeFriend(user, friendOid);
  }

  @Router.get("/friend/requests")
  async getRequests(session: SessionDoc) {
    const user = Sessioning.getUser(session);
    return await Responses.friendRequests(await Friending.getRequests(user));
  }

  @Router.post("/friend/requests/:to")
  async sendFriendRequest(session: SessionDoc, to: string) {
    const user = Sessioning.getUser(session);
    const toOid = (await Authing.getUserByUsername(to))._id;
    return await Friending.sendRequest(user, toOid);
  }

  @Router.delete("/friend/requests/:to")
  async removeFriendRequest(session: SessionDoc, to: string) {
    const user = Sessioning.getUser(session);
    const toOid = (await Authing.getUserByUsername(to))._id;
    return await Friending.removeRequest(user, toOid);
  }

  @Router.put("/friend/accept/:from")
  async acceptFriendRequest(session: SessionDoc, from: string) {
    const user = Sessioning.getUser(session);
    const fromOid = (await Authing.getUserByUsername(from))._id;
    return await Friending.acceptRequest(fromOid, user);
  }

  @Router.put("/friend/reject/:from")
  async rejectFriendRequest(session: SessionDoc, from: string) {
    const user = Sessioning.getUser(session);
    const fromOid = (await Authing.getUserByUsername(from))._id;
    return await Friending.rejectRequest(fromOid, user);
  }

  // Verification Routes

  /**
   * Submit verification data for the current user.
   * @param data - Verification data (e.g., government ID information).
   * @returns A success message.
   */
  @Router.post("/verifications")
  async submitVerification(session: SessionDoc, data: string) {
    const userID = Sessioning.getUser(session);
    const verificationData: VerificationData = { method: "government_id", data };
    await VerifyingIdentity.submitVerification(userID, verificationData);
    return { msg: "Verification submitted successfully." };
  }

  /**
   * Get the verification status of the current user.
   * @returns The verification status: 'verified', 'unverified', or 'pending'.
   */
  @Router.get("/verifications/status")
  async getVerificationStatus(session: SessionDoc) {
    const userID = Sessioning.getUser(session);
    const statusResult = await VerifyingIdentity.getVerificationStatus(userID);
    return statusResult;
  }

  /**
   * Approve a user's verification
   * @param userID - The ID of the user to approve.
   * @returns A success message.
   */
  @Router.put("/verifications/:userID/approve")
  async approveVerification(session: SessionDoc, userID: string) {
    const userObjectID = new ObjectId(userID);
    await VerifyingIdentity.approveVerification(userObjectID);
    return { msg: "Verification approved successfully." };
  }

  /**
   * Reject a user's verification
   * @param userID - The ID of the user to reject.
   * @returns A success message.
   */
  @Router.put("/verifications/:userID/reject")
  async rejectVerification(session: SessionDoc, userID: string) {
    const userObjectID = new ObjectId(userID);
    await VerifyingIdentity.rejectVerification(userObjectID);
    return { msg: "Verification rejected successfully." };
  }

  // Participation Routes

  /**
   * Join an event.
   * @param id - The ID of the event to join.
   * @returns A success message.
   * @throws NotFoundError if the event does not exist.
   */
  @Router.post("/events/:id/join")
  async joinEvent(session: SessionDoc, id: string) {
    const userID = Sessioning.getUser(session);
    const eventID = new ObjectId(id);
    // Ensure the event exists
    const event = await Posting.posts.readOne({ _id: eventID });
    if (!event) {
      throw new NotFoundError("Event not found.");
    }
    await Joining.joinActivity(userID, eventID);
    return { msg: "Successfully joined the event." };
  }

  /**
   * Leave an event.
   * @param id - The ID of the event to leave.
   * @returns A success message.
   */
  @Router.delete("/events/:id/join")
  async leaveEvent(session: SessionDoc, id: string) {
    const userID = Sessioning.getUser(session);
    const eventID = new ObjectId(id);
    await Joining.leaveActivity(userID, eventID);
    return { msg: "Successfully left the event." };
  }

  /**
   * Retrieve participants of an event.
   * @param id - The ID of the event.
   * @returns A list of participant usernames.
   */
  @Router.get("/events/:id/participants")
  async getEventParticipants(id: string) {
    const eventID = new ObjectId(id);
    const participantIDs = await Joining.getParticipants(eventID);
    const participants = await Authing.idsToUsernames(participantIDs);
    return participants;
  }

  /**
   * Retrieve events that a user has joined.
   * @param username - The username of the user.
   * @returns A list of events.
   */
  @Router.get("/users/:username/events")
  async getUserEvents(username: string) {
    const user = await Authing.getUserByUsername(username);
    const eventIDs = await Joining.getActivitiesForUser(user._id);
    const events = await Posting.posts.readMany({ _id: { $in: eventIDs } });
    return Responses.posts(events);
  }

  // Endorsement Routes

  /**
   * Endorse a user for a skill.
   * @param username - The username of the user to endorse.
   * @param skill - The skill to endorse.
   * @returns A success message.
   */
  @Router.post("/users/:username/endorsements")
  async endorseUser(session: SessionDoc, username: string, skill: string) {
    const endorserID = Sessioning.getUser(session);
    const endorsedUser = await Authing.getUserByUsername(username);
    await Endorsing.endorseUser(endorserID, endorsedUser._id, skill);
    return { msg: `Successfully endorsed ${username} for ${skill}.` };
  }

  /**
   * Remove an endorsement from a user.
   * @param username - The username of the user.
   * @param skill - The skill endorsement to remove.
   * @returns A success message.
   */
  @Router.delete("/users/:username/endorsements")
  async removeEndorsement(session: SessionDoc, username: string, skill: string) {
    const endorserID = Sessioning.getUser(session);
    const endorsedUser = await Authing.getUserByUsername(username);
    await Endorsing.removeEndorsement(endorserID, endorsedUser._id, skill);
    return { msg: `Removed endorsement of ${username} for ${skill}.` };
  }

  /**
   * Get endorsements for a user.
   * @param username - The username of the user.
   * @returns An object containing the username and their endorsed skills.
   */
  @Router.get("/users/:username/endorsements")
  async getUserEndorsements(username: string) {
    const user = await Authing.getUserByUsername(username);
    const skills = await Endorsing.getEndorsedSkills(user._id);
    return { username, skills };
  }

  // Location Sharing Routes

  /**
   * Share or update the current user's location.
   * @param latitude - The latitude of the location.
   * @param longitude - The longitude of the location.
   * @returns A success message.
   * @throws NotAllowedError if location sharing is disabled.
   */
  @Router.post("/location/share")
  async shareLocation(session: SessionDoc, latitude: number, longitude: number) {
    const userID = Sessioning.getUser(session);
    await LocationSharing.shareLocation(userID, latitude, longitude);
    return { msg: "Location shared successfully." };
  }

  /**
   * Stop sharing the current user's location.
   * @returns A success message.
   */
  @Router.delete("/location/share")
  async stopSharingLocation(session: SessionDoc) {
    const userID = Sessioning.getUser(session);
    await LocationSharing.stopSharingLocation(userID);
    return { msg: "Stopped sharing location." };
  }

  /**
   * Get a user's shared location.
   * @param username - The username of the user whose location to retrieve.
   * @returns An object containing the user's location data.
   */
  @Router.get("/users/:username/location")
  async getUserLocation(session: SessionDoc, username: string) {
    //const requestingUserID = Sessioning.getUser(session);
    const user = await Authing.getUserByUsername(username);
    const location = await LocationSharing.getLocation(user._id);
    return {
      username,
      latitude: location.latitude,
      longitude: location.longitude,
      timestamp: location.timestamp,
    };
  }

  /**
   * Enable location sharing for the current user.
   * @returns A success message.
   */
  @Router.post("/location/enable")
  async enableLocationSharing(session: SessionDoc) {
    const userID = Sessioning.getUser(session);
    await LocationSharing.enableLocationSharing(userID);
    return { msg: "Location sharing enabled." };
  }

  /**
   * Disable location sharing for the current user.
   * @returns A success message.
   */
  @Router.post("/location/disable")
  async disableLocationSharing(session: SessionDoc) {
    const userID = Sessioning.getUser(session);
    await LocationSharing.disableLocationSharing(userID);
    return { msg: "Location sharing disabled." };
  }

  /**
   * Add a trusted contact for the current user.
   * @param contactUsername - The username of the contact to add.
   * @returns A success message.
   * @throws NotFoundError if the contact user does not exist.
   */
  @Router.post("/location/trusted-contacts")
  async addTrustedContact(session: SessionDoc, contactUsername: string) {
    const userID = Sessioning.getUser(session);
    const contact = await Authing.getUserByUsername(contactUsername);
    if (!contact) {
      throw new NotFoundError("Contact user not found.");
    }
    await LocationSharing.addTrustedContact(userID, contact._id);
    return { msg: `Trusted contact ${contactUsername} added.` };
  }

  /**
   * Remove a trusted contact for the current user.
   * @param contactUsername - The username of the contact to remove.
   * @returns A success message.
   * @throws NotFoundError if the contact user does not exist.
   */
  @Router.delete("/location/trusted-contacts/:contactUsername")
  async removeTrustedContact(session: SessionDoc, contactUsername: string) {
    const userID = Sessioning.getUser(session);
    const contact = await Authing.getUserByUsername(contactUsername);
    if (!contact) {
      throw new NotFoundError("Contact user not found.");
    }
    await LocationSharing.removeTrustedContact(userID, contact._id);
    return { msg: `Trusted contact ${contactUsername} removed.` };
  }

  /**
   * Get all trusted contacts for the current user.
   * @returns An object containing a list of trusted contact usernames.
   */
  @Router.get("/location/trusted-contacts")
  async getTrustedContacts(session: SessionDoc) {
    const userID = Sessioning.getUser(session);
    const contacts = await LocationSharing.getTrustedContacts(userID);
    // Convert ObjectIds to usernames
    const contactUsernames = await Authing.idsToUsernames(contacts);
    return { contacts: contactUsernames };
  }

  /**
   * Get the current location sharing status of the current user.
   * @returns An object indicating whether location sharing is enabled.
   */
  @Router.get("/location/sharing-status")
  async getSharingStatus(session: SessionDoc) {
    const userID = Sessioning.getUser(session);
    const status = await LocationSharing.getSharingStatus(userID);
    return { enabled: status };
  }

  /**
   * Get current locations of all trusted contacts for the current user.
   * @returns An object containing a list of locations of trusted contacts.
   */
  @Router.get("/location/trusted-contacts/locations")
  async getTrustedContactsLocations(session: SessionDoc) {
    const userID = Sessioning.getUser(session);
    const locations = await LocationSharing.getTrustedContactsLocations(userID);
    const formattedLocations = locations.map((loc) => ({
      userID: loc.userID,
      latitude: loc.latitude,
      longitude: loc.longitude,
      timestamp: loc.timestamp,
    }));
    return { locations: formattedLocations };
  }
}

/** The web app. */
export const app = new Routes();

/** The Express router. */
export const appRouter = getExpressRouter(app);
