export function generateConventionFromApplication(application) {
  return {
    id: `conv-${Date.now()}`,
    applicationId: application.id,
    studentName: application.studentName,
    studentEmail: application.studentEmail,
    ngoName: application.ngoName,
    missionDescription: application.missionDescription,
    startDate: application.startDate,
    endDate: application.endDate,
    targetHours: application.targetHours,
    status: 'ready'
  };
}
