import { createConversation } from "@/api/chat";
import useChatStore from ".";
import type { ConversationSchema } from "@/common/types";
export const chatToSomeone = async (id: number) => {
  const conversations = useChatStore.getState().conversations;

  let res: ConversationSchema | null = null;
  const conversation = conversations.find(conversation => conversation.type === "direct" && conversation.participants.some(participant => participant.userId === id));

  if (conversation) {
    res = conversation;
  } else {
    const request = await createConversation({
      participantIds: [id],
      type: "direct",
    });
    res = request.conversation;
  }

  useChatStore.getState().setCurrentConversation(res);
  return res;
}
