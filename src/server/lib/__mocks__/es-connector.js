export const mockQuery = jest.fn();

const mockMC = jest.fn();
mockMC.searchESData = mockQuery;
mockMC.updateESData = mockQuery;
mockMC.bulkIngest = mockQuery;
mockMC.bulkHelperIngest = mockQuery;
mockMC.deleteESDataByClusterId = mockQuery;
mockMC.deleteESDataByRunId = mockQuery;

export default mockMC;