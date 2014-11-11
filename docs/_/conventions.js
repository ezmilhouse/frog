// validations
// only on pub level
var callback = function(err, body, status, code) {

    // callbacks always have 4 params
    // err      {bol|null}  - null, false, true
    // body     {obj}       - returning object
    // status   {int}       - http status code, also used internally 200, 201, 202, 204,

};

// fallback codes based on the http schema
var codes = {
    '200' : 'OK',
    '201' : 'OK_CREATED',
    '202' : 'OK_ACCEPTED',
    '204' : 'OK_NO_CONTENT',
    '400' : 'ERROR_BAD_REQUEST',
    '401' : 'ERROR_UNAUTHORIZED',
    '403' : 'ERROR_FORBIDDEN',
    '404' : 'ERROR_NOT_FOUND',
    '409' : 'ERROR_CONFLICT',
    '500' : 'ERROR_INTERNAL_SERVER_ERROR'
};

// list of error codes
var codes = [

    // [+] 200
    // all good, set automatically (most of the time by Sever.REST .send() method)
    'OK',

    // [+] 202
    // all good, request accepted, used to answer preflight OPTIONS requests (in CORS settings)
    'ACCEPTED',

    // [-] 400
    // creation of activation token failed (most of the time, saving of the token failed)
    'ERROR_COULD_NOT_ADD_TOKEN',

    // [-] 400
    // db query failed, mongo returned err
    'ERROR_DB_QUERY',

    // [-] 400
    // db save not possible because incoming request is missing body object (cannot create)
    'ERROR_DB_QUERY_BODY_DOES_NOT_EXIST_FOR_CREATE',

    // [-] 400
    // db save not possible because incoming request is missing body object (cannot update)
    'ERROR_DB_QUERY_BODY_DOES_NOT_EXIST_FOR_UPDATE',

    // [-] 400
    // request doesn't come with id set
    'ERROR_DB_QUERY_ID_NOT_SET',

    // [-] 400
    // could not get email templates
    'ERROR_EMAIL_TEMPLATES_COULD_NOT_BE_LOADED',

    // [-] 400
    // could not render email from template
    'ERROR_EMAIL_NOT_RENDERED',

    // [-] 400
    // could not sent email
    'ERROR_EMAIL_NOT_SENT',

    // [-] 400
    // request doesn't have a query name (ex: 'index', 'retrieve' or some custom) assigned
    'ERROR_RESOURCE_QUERY_NOT_SET',

    // [-] 404
    // db query was successful, but didn't return documents
    'ERROR_DB_QUERY_NO_RESULTS',

    // [-] 404
    // db query on document to be updated returned empty result
    'ERROR_DB_QUERY_NO_RESULTS_BEFORE_UPDATE',

    // [-] 404
    // db query on document to be deleted returned empty result
    'ERROR_DB_QUERY_NO_RESULTS_BEFORE_DELETE',

    // [-] 404
    // request targets query on resource that does not exist
    'ERROR_RESOURCE_QUERY_NOT_FOUND',

    // [-] 409
    // validation failed, single (or multiple) validation rules returned errors
    'ERROR_VALIDATION_FAILED',

    // [-] 409
    // validation failed, email already taken
    'ERROR_EMAIL_ALREADY_TAKEN',

    // [-] 409
    // validation failed, name already taken
    'ERROR_NAME_ALREADY_TAKEN'

];