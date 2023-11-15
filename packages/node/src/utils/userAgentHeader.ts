import packageJson from '../../package.json';

const { version: sdkVersion } = packageJson;
export const createUserAgentHeader = ({
  serviceName,
  serviceRelease,
}: {
  serviceName: string;
  serviceRelease: string;
}) => `${serviceName}/${serviceRelease} StanzaNodeSDK/${sdkVersion}`;
