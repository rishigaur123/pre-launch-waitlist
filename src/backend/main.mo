import Set "mo:core/Set";
import Text "mo:core/Text";
import Array "mo:core/Array";
import Runtime "mo:core/Runtime";

actor {
  let emails = Set.empty<Text>();

  public shared ({ caller }) func addEmail(email : Text) : async () {
    if (emails.contains(email)) {
      Runtime.trap("Email is already submitted");
    };
    emails.add(email);
  };

  public query ({ caller }) func getAllEmails() : async [Text] {
    emails.toArray();
  };
};
