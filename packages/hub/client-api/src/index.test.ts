describe('index', () => {
  // at least one test is necessary so that the coverage report is not empty which causes CI to break
  it('should import without errors', async () => {
    await expect(import('./index')).resolves.toBeDefined();
  });
});
