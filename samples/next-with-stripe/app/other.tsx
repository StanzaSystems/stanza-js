import { OtherOnClient } from './otherOnClient';

export const Other = async ({ initVal }: { initVal?: number }) => {
  await new Promise((resolve) => {
    setTimeout(resolve, 500);
  });

  return (
    <div>
      Other
      <OtherOnClient initialVal={initVal ?? Math.random()} />
    </div>
  );
};
