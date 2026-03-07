import nodemailer from "nodemailer";

const transporters = new Map();

const DEFAULT_HOST = "smtp.gmail.com";
const DEFAULT_PORT = 587;

const getConfiguredPort = () => {
  const port = Number(process.env.SMTP_PORT || DEFAULT_PORT);
  return Number.isFinite(port) ? port : DEFAULT_PORT;
};

const createConfigKey = (config) =>
  JSON.stringify({
    host: config.host || "",
    port: config.port || 0,
    secure: Boolean(config.secure),
    service: config.service || "",
  });

const createTransportOptions = ({ host, port, service }) => ({
  ...(service ? { service } : { host }),
  port,
  secure: port === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  requireTLS: port !== 465,
  pool: true,
  maxConnections: 3,
  maxMessages: 50,
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 15000,
  family: 4,
  tls: {
    rejectUnauthorized: false,
  },
});

export const hasSmtpConfig = () =>
  Boolean(process.env.SMTP_USER && process.env.SMTP_PASS);

export const getTransportConfigs = () => {
  const configuredHost = process.env.SMTP_HOST || DEFAULT_HOST;
  const configuredPort = getConfiguredPort();

  const configs = [
    { host: configuredHost, port: configuredPort },
    { host: configuredHost, port: configuredPort === 587 ? 465 : 587 },
  ];

  if (configuredHost === DEFAULT_HOST) {
    configs.push({ host: DEFAULT_HOST, port: 587, service: "gmail" });
    configs.push({ host: DEFAULT_HOST, port: 465, service: "gmail" });
  }

  return configs.filter((config, index, array) => {
    const key = createConfigKey(config);
    return array.findIndex((item) => createConfigKey(item) === key) === index;
  });
};

export const getTransporter = (config = getTransportConfigs()[0]) => {
  const key = createConfigKey(config);

  if (transporters.has(key)) {
    return transporters.get(key);
  }

  const transporter = nodemailer.createTransport(createTransportOptions(config));
  transporters.set(key, transporter);
  return transporter;
};

export const resetTransporters = () => {
  transporters.clear();
};

export const verifySmtpConnection = async () => {
  const configs = getTransportConfigs();
  const errors = [];

  for (const config of configs) {
    try {
      const transporter = getTransporter(config);
      await transporter.verify();
      return true;
    } catch (error) {
      errors.push(`${config.host}:${config.port} ${error.message}`);
    }
  }

  throw new Error(errors.join(" | "));
};
