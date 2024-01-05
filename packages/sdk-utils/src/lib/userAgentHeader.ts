export const createUserAgentHeader = ({
  serviceName,
  serviceRelease,
  sdkName,
  sdkVersion,
}: {
  serviceName: string;
  serviceRelease: string;
  sdkName: string;
  sdkVersion: string;
}) => `${serviceName}/${serviceRelease} ${sdkName}/${sdkVersion}`;
