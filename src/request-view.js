export function getEmptyStateCopy(totalRequestCount, selectedPriority) {
  const showAddRequestMessage = totalRequestCount === 0 && selectedPriority === "All";

  return {
    title: showAddRequestMessage ? "No requests yet" : "No requests were found.",
    showAddRequestMessage,
  };
}