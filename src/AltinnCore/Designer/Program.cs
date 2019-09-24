using System;
using System.IO;
using Microsoft.ApplicationInsights.Extensibility;
using Microsoft.AspNetCore;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Azure.KeyVault;
using Microsoft.Azure.KeyVault.Models;
using Microsoft.Azure.Services.AppAuthentication;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Configuration.AzureKeyVault;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Serilog;
using Serilog.Core;
using Serilog.Extensions.Logging;

namespace AltinnCore.Designer
{
    /// <summary>
    /// This is the main method for running this asp.net core application without IIS
    /// </summary>
    public static class Program
    {
        private static Logger logger = new LoggerConfiguration()
            .WriteTo.Console()
            .CreateLogger();

        /// <summary>
        /// The main method
        /// </summary>
        /// <param name="args">The Arguments</param>
        public static void Main(string[] args)
        {
            CreateWebHostBuilder(args).Build().Run();
        }

        /// <summary>
        /// Configure the configuration builder
        /// </summary>
        /// <param name="args">arguments for creating build configuration</param>
        /// <returns>The web host builder</returns>
        public static IWebHostBuilder CreateWebHostBuilder(string[] args) =>
            WebHost.CreateDefaultBuilder(args)
            .ConfigureAppConfiguration((hostingContext, config) =>
            {
                string basePath = Directory.GetParent(Directory.GetCurrentDirectory()).FullName;
                config.SetBasePath(basePath);
                config.AddJsonFile(basePath + "altinn-appsettings/altinn-appsettings-secret.json", optional: true, reloadOnChange: true);
                if (basePath == "/")
                {
                    config.AddJsonFile(basePath + "app/appsettings.json", optional: false, reloadOnChange: true);
                }
                else
                {
                    config.AddJsonFile(Directory.GetCurrentDirectory() + "/appsettings.json", optional: false, reloadOnChange: true);
                }

                config.AddEnvironmentVariables();
                config.AddCommandLine(args);
                IConfiguration stageOneConfig = config.Build();
                string appId = stageOneConfig.GetValue<string>("KvSetting:ClientId");
                string tenantId = stageOneConfig.GetValue<string>("KvSetting:TenantId");
                string appKey = stageOneConfig.GetValue<string>("KvSetting:ClientSecret");
                string keyVaultEndpoint = stageOneConfig.GetValue<string>("KvSetting:SecretUri");
                if (!string.IsNullOrEmpty(appId) && !string.IsNullOrEmpty(tenantId)
                    && !string.IsNullOrEmpty(appKey) && !string.IsNullOrEmpty(keyVaultEndpoint))
                {
                    AzureServiceTokenProvider azureServiceTokenProvider = new AzureServiceTokenProvider($"RunAs=App;AppId={appId};TenantId={tenantId};AppKey={appKey}");
                    KeyVaultClient keyVaultClient = new KeyVaultClient(
                        new KeyVaultClient.AuthenticationCallback(
                            azureServiceTokenProvider.KeyVaultTokenCallback));
                    config.AddAzureKeyVault(
                        keyVaultEndpoint, keyVaultClient, new DefaultKeyVaultSecretManager());

                    try
                    {
                        SecretBundle secretBundle = keyVaultClient.GetSecretAsync(
                            keyVaultEndpoint, "ApplicationInsights--InstrumentationKey").Result;
                        SetTelemetry(secretBundle.Value);
                    }
                    catch (Exception vaultException)
                    {
                        logger.Error($"Could not find secretBundle for application insights {vaultException}");
                    }
                }
            })
            .ConfigureLogging((hostingContext, logging) =>
            {
                logging.ClearProviders();
                Serilog.ILogger logger = new LoggerConfiguration()
                                .WriteTo.Console(outputTemplate: "[{Timestamp:HH:mm:ss.ffff} {Level:u3}] {Message:lj}{NewLine}{Exception}")
                                .CreateLogger();

                logging.AddProvider(new SerilogLoggerProvider(logger));
            })
                .UseStartup<Startup>()
                .CaptureStartupErrors(true);

        private static void SetTelemetry(string instrumentationKey)
        {
            logger.Information($"Setting application insights telemetry with instrumentationKey='{instrumentationKey}'");
            if (!string.IsNullOrEmpty(instrumentationKey))
            {
                TelemetryConfiguration.Active.InstrumentationKey = instrumentationKey;
            }
        }
    }
}
