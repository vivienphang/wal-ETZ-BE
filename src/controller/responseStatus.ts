const responseStatus = {
  APPEND_TO_USER_FAILED: "error in appending account to user",
  BAD_CONNECTION: "error in connecting to db",
  CREATED_USER: "user successfully created",
  CREATE_USER_FAILED: "unable to create user",
  CREATE_ACCOUNT_FAILED: "unable to create account",
  CREATE_RECORD_FAILED: "unable to create record",
  JWT_REFRESHED: "JWT successfully refreshed",
  LOGGED_IN: "Log in successful",
  NOT_FOUND: "unable to find data",
  USER_NOT_FOUND: "user not found",
  PASSWORD_MISMATCH: "password mismatch",
  QUERY_COMPLETE: "query complete",
};

export default responseStatus;
