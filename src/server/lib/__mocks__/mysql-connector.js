export const mockExecuteQuery = jest.fn();

const mockMC = jest.fn();
mockMC.executeQuery = mockExecuteQuery;

export default mockMC;