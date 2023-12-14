export const createUserAgentHeader = ({
  serviceName,
  serviceRelease,
  sdkVersion,
}: {
  serviceName: string;
  serviceRelease: string;
  sdkVersion: string;
}) => `${serviceName}/${serviceRelease} StanzaNodeSDK/${sdkVersion}`;
