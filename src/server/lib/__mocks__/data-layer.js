export const mockGetProjects = jest.fn(() => 'working ');
export const mockUpdateProject = jest.fn();
export const mockGetCaaId = jest.fn();
export const mockGetProject = jest.fn();
export const mockCreateProject = jest.fn();

const mockDataLayer = jest.fn().mockImplementation(() => {
  return {getProjects: mockGetProjects, updateProject: mockUpdateProject, getCAAid: mockGetCaaId, getProject: mockGetProject, createProject: mockCreateProject};
});

export default mockDataLayer;

