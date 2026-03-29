export default function generatePrivateConversationId(
  courseId: string,
  senderId: string,
  receiverId: string,
): string {
  // Sort both IDs alphabetically so order doesn't matter
  const sortedIds = [senderId, receiverId].sort();

  // Join them with a separator to create unique key
  return `${courseId}_${sortedIds[0]}_${sortedIds[1]}`;
}
