using Reveal.Sdk;
using Reveal.Sdk.Data;
using Reveal.Sdk.Data.Microsoft.SqlServer;

namespace RevealSdk.Server.Reveal
{
    public class DataSourceItemFilter : IRVObjectFilter
    {
        public Task<bool> Filter(IRVUserContext userContext, RVDashboardDataSource dataSource)
        {
            return Task.FromResult(true);
        }
        public Task<bool> Filter(IRVUserContext userContext, RVDataSourceItem dataSourceItem)
        {
            if (userContext?.Properties != null && dataSourceItem is RVSqlServerDataSourceItem dataSQLItem)
            {
                if (userContext.Properties.TryGetValue("FilterTables", out var filterTablesObj) &&
                    filterTablesObj is string[] filterTables)
                {
                    // If filterTables is empty, allow all
                    if (filterTables.Length == 0)
                        return Task.FromResult(true);

                    // Otherwise, restrict to allowed tables/procedures
                    if ((dataSQLItem.Table != null && !filterTables.Contains(dataSQLItem.Table)) ||
                        (dataSQLItem.Procedure != null && !filterTables.Contains(dataSQLItem.Procedure)))
                    {
                        return Task.FromResult(false);
                    }
                }
            }
            return Task.FromResult(true);
        }
    }
}