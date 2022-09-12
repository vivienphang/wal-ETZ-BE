const responseStatus = {
  APPEND_TO_USER_FAILED: "error in appending account to user",
  BAD_CONNECTION: "error in connecting to db",
  CREATED_USER: "user successfully created",
  CREATE_USER_FAILED: "unable to create user",
  CREATE_ACCOUNT_FAILED: "unable to create account",
  CREATE_RECORD_FAILED: "unable to create record",
  JWT_REFRESHED: "JWT successfully refreshed",
  JWT_NO_USER: "user not found",
  LOGGED_IN: "Log in successful",
  NOT_FOUND: "unable to find data",
  OAUTH_LOGGED_IN: "Oauth log in sucessful",
  OAUTH_LOGGED_IN_FAIL: "Oauth log in failed",
  USER_NOT_FOUND: "username/ email not found",
  PASSWORD_MISMATCH: "password mismatch",
  POPULATE_FAIL: "failed to populate user data",
  POPULATE_SUCCESS: "populated user data",
  QUERY_COMPLETE: "query complete",
  SESSION_ERROR: "session error",
  UPDATE_PROFILE_FAILED: "failed to update user profile",
  UPDATE_PROFILE_SUCCESS: "update user profile successful",
};

export default responseStatus;
