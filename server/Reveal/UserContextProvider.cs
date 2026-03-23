using Microsoft.Extensions.Options;
using Reveal.Sdk;
using RevealSdk.Server.Configuration;

namespace RevealSdk.Server.Reveal
{

    public class UserContextProvider : IRVUserContextProvider
    {
        private readonly SqlServerOptions _sqlOptions;

        public UserContextProvider(IOptions<SqlServerOptions> sqlOptions)
        {
            _sqlOptions = sqlOptions.Value;
        }

        IRVUserContext IRVUserContextProvider.GetUserContext(HttpContext? aspnetContext)
        {
            if(aspnetContext == null)
            {
                return new RVUserContext("reveal-ai-metadata-user", new Dictionary<string, object>
                {
                    { "Host", _sqlOptions.Host },
                    { "Database", _sqlOptions.Database },
                    { "Username", _sqlOptions.Username },
                    { "Password", _sqlOptions.Password },
                    { "Schema", _sqlOptions.Schema }
                });
            }

            string? headerValue = aspnetContext.Request.Headers["x-header-one"].FirstOrDefault();
            string? userId = null;
            string? orderId = null;

            if (!string.IsNullOrEmpty(headerValue))
            {
                var pairs = headerValue.Split(',');
                foreach (var pair in pairs)
                {
                    var kv = pair.Split(':', 2);
                    if (kv.Length == 2)
                    {
                        var key = kv[0].Trim();
                        var value = kv[1].Trim();
                        if (key.Equals("userId", StringComparison.OrdinalIgnoreCase))
                            userId = value;
                        else if (key.Equals("orderId", StringComparison.OrdinalIgnoreCase))
                            orderId = value;
                    }
                }
            }

            // default to User role
            string role = "User";

            // null is used here just for demo 
            if (userId == "BLONP" || userId == null)
            {
                role = "Admin";
            }

            var filterTables = role == "Admin"
                ? Array.Empty<string>()
                : new[] { "Customers", "Orders" };

            var props = new Dictionary<string, object>
            {
                { "OrderId", orderId ?? string.Empty },
                { "Role", role },
                { "Host", _sqlOptions.Host },
                { "Database", _sqlOptions.Database },
                { "Username", _sqlOptions.Username },
                { "Password", _sqlOptions.Password },
                { "Schema", _sqlOptions.Schema },
                { "FilterTables", filterTables }
            };

            return new RVUserContext(userId, props);
        }
    }
}