import { RouterLocation } from '@bot/navigation/core/conversations/conversations.types';

export async function navigate(ctx: any, location: RouterLocation) {
  ctx.session.location = location;
  await ctx.router.handleUpdate(ctx.update);
}
