VSS.init({
    explicitNotifyLoaded: true,
    usePlatformStyles: true,
    // usePlatformScripts: true

});

VSS.require("TFS/Dashboards/WidgetHelpers", "TFS/Build/RestClient", function (WidgetHelpers, TFS_Build_WebApi) {
    VSS.register("CodeCoverage.Configuration", function () {
        WidgetHelpers.IncludeWidgetConfigurationStyles()

        // const projectId = VSS.getWebContext().project.id
        // const $title = $("#title-input")
        // let $buildDropdown = $("#build-definition-dropdown");
        // let $decimalDropdown = $("#decimal-dropdown");
        // let $checkOptionBuildName = $("#build-name");
        // let $checkOptionLinesCovered = $("#lines-covered");
        // let $checkOptionLinesTotal = $("#lines-total");
        // let $checkOptionCoverageDelta = $("#coverage-delta");
        // var $queryDropdown = $("#decimal-dropdown");

        // return {
        //     load: function (widgetSettings, widgetConfigurationContext) {
        //         // let settings = JSON.parse(widgetSettings.customSettings.data);

        //         // TFS_Build_WebApi.getClient().getDefinitions(projectId).then(function (definitions){
        //         //     $.each(definitions, function(value) {
        //         //         console.log("def " + definitions.name)
        //         //         $buildDropdown.append($("<option />").val(value.id).text(value.name))

        //         //     });

        //         // });
        //         // $queryDropdown.on("change", function () {
        //         //     var customSettings = { data: JSON.stringify({ queryPath: $queryDropdown.val() }) };
        //         //     var eventName = WidgetHelpers.WidgetEvent.ConfigurationChange;
        //         //     var eventArgs = WidgetHelpers.WidgetEvent.Args(customSettings);
        //         //     widgetConfigurationContext.notify(eventName, eventArgs);
        //         // });

        //         return WidgetHelpers.WidgetStatusHelper.Success();
        //     },
        //     onSave: function () {
        //         // var customSettings = {
        //         //     data: JSON.stringify({
        //         //         queryPath: $queryDropdown.val()
        //         //     })
        //         // };
        //         return WidgetHelpers.WidgetConfigurationSave.Valid();
        //     }

        return {
            load: function (widgetSettings, widgetConfigurationContext) {
                var settings = JSON.parse(widgetSettings.customSettings.data);
                if (settings && settings.queryPath) {
                    $queryDropdown.val(settings.queryPath);
                }

                $queryDropdown.on("change", function () {
                    var customSettings = {
                        data: JSON.stringify({
                            queryPath: $queryDropdown.val()
                        })
                    };
                    var eventName = WidgetHelpers.WidgetEvent.ConfigurationChange;
                    var eventArgs = WidgetHelpers.WidgetEvent.Args(customSettings);
                    widgetConfigurationContext.notify(eventName, eventArgs);

                });

                return WidgetHelpers.WidgetStatusHelper.Success();
            },
            onSave: function () {
                var customSettings = {
                    data: JSON.stringify({
                        queryPath: $queryDropdown.val()
                    })
                };
                return WidgetHelpers.WidgetConfigurationSave.Valid(customSettings);
            }
        }
    });
    VSS.notifyLoadSucceeded();
});