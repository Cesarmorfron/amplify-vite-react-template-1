import type { Schema } from '../../data/resource';

export const handler: Schema['blacklistLambda']['functionHandler'] = async (
  event
) => {
  console.log(event);

  return 'success';
};
