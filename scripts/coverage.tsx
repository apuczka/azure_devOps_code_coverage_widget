import * as SDK from "azure-devops-extension-sdk"

SDK.init();
const WidgetHelpers = await SDK.requireModule<ITFSDashboardsWidgetHelpers>("TFS/Dashboards/WidgetHelpers")