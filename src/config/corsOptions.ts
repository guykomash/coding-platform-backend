const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

const corsOptions = {
  origin: clientUrl,
};

export { corsOptions };
