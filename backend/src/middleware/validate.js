const { badRequest } = require('../lib/errors');

/**
 * Validate req[source] against a zod schema and replace it with the parsed output.
 * Validation errors become a 400 with a field -> message map the frontend can render inline.
 */
function validate(schema, source = 'body') {
  return (req, res, next) => {
    const result = schema.safeParse(req[source] ?? {});
    if (!result.success) {
      const fields = {};
      for (const issue of result.error.issues) {
        const key = issue.path.join('.') || '_';
        if (!fields[key]) fields[key] = issue.message;
      }
      return next(badRequest('Please check the highlighted fields', { fields }));
    }
    if (source === 'query') {
      req.validatedQuery = result.data; // req.query is read-only in Express 5
    } else {
      req[source] = result.data;
    }
    next();
  };
}

module.exports = { validate };
