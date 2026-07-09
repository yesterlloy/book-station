const getPaginationParams = (query) => {
  const page = Math.max(1, parseInt(query.page) || 1);
  const pageSize = Math.min(100, Math.max(1, parseInt(query.pageSize) || 20));
  const skip = (page - 1) * pageSize;

  return {
    page,
    pageSize,
    skip,
    limit: pageSize,
  };
};

const getSortParams = (query, defaultSort = { createdAt: -1 }) => {
  if (!query.sortBy) return defaultSort;

  const sortField = query.sortBy;
  const sortOrder = query.sortOrder === 'asc' ? 1 : -1;

  return { [sortField]: sortOrder };
};

module.exports = {
  getPaginationParams,
  getSortParams,
};
