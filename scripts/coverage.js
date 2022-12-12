VSS.init({
    explicitNotifyLoaded: true,
    usePlatformStyles: true
});

VSS.require(["TFS/Dashboards/WidgetHelpers", "TFS/TestManagement/RestClient", "TFS/Build/RestClient"],
    function (WidgetHelpers, TFS_Test_Api, TFS_Build_Api) {
        WidgetHelpers.IncludeWidgetStyles();
        VSS.register("CodeCoverageWidget", function () {
            const projectId = VSS.getWebContext().project.id;
            const definitionIds = [417];
            const projectBaseUrl = "https://dev.azure.com/PG-Digital/" + projectId;
            var getCodeCoverage = function (widgetSettings) {
                const settings = JSON.parse(widgetSettings.customSettings.data)
                const testClient = TFS_Test_Api.getClient();
                const buildClient = TFS_Build_Api.getClient();
                let buildsToCompare = [];

                let buildList = buildClient.getBuilds(projectId, definitionIds, null, null, null, null, null, null, "Completed", "Succeeded", null, null, null, 2, null, null, null, null, null)
                buildList.then(builds => {
                    buildsToCompare.push(builds[0]);
                    buildsToCompare.push(builds[1]);
                    return builds;
                })
                    .then((compare) => {
                        buildsToCompare.sort((a, b) => b.finishTime - a.finishTime);
                        const latestBuild = buildsToCompare[0];
                        const buildUrl = new URL(projectBaseUrl + "/_build/results")
                        buildUrl.searchParams.append("buildID", latestBuild.id)
                        buildUrl.searchParams.append("view", "codecoverage-tab")

                        let latestBuildLinesCovered = 0
                        let latestBuildLinesTotal = 0
                        let latestBuildCodeCoverage = 0

                        const previousBuild = buildsToCompare[1];
                        let previousBuildLinesCovered = 0
                        let previousBuildLinesTotal = 0
                        let previousBuildCodeCoverage = 0

                        const latestBuildCodeCoverageData = getCodeCoverageForBuild(projectId, latestBuild.id, testClient);
                        const previousBuildCodeCoverageData = getCodeCoverageForBuild(projectId, previousBuild.id, testClient);

                        latestBuildCodeCoverageData.then((latestBuildCodeCoverageData) => {
                            latestBuildCodeCoverageData[0].coverageStats.forEach(stats => {
                                latestBuildLinesCovered += stats.covered;
                                latestBuildLinesTotal += stats.total;

                            });
                            latestBuildCodeCoverage = latestBuildLinesCovered / latestBuildLinesTotal * 100;
                            console.log("lat " + latestBuildCodeCoverage);

                            previousBuildCodeCoverageData.then((previousBuildCodeCoverageData) => {
                                previousBuildCodeCoverageData[0].coverageStats.forEach(stats => {
                                    previousBuildLinesCovered += stats.covered;
                                    previousBuildLinesTotal += stats.total;
                                });
                                previousBuildCodeCoverage = previousBuildLinesCovered / previousBuildLinesTotal * 100;

                                const codeCoverageDiff = latestBuildCodeCoverage - previousBuildCodeCoverage;
                                const coveredLinesDiff = latestBuildLinesCovered - previousBuildLinesCovered;
                                const totalLinesDiff = latestBuildLinesTotal - previousBuildLinesTotal;

                                let $title = $('h1.title');
                                $title.text('Code Coverage');

                                let $codeCoverageContainer = $('#code_coverage_container');
                                $codeCoverageContainer.css('backgroundColor', function () {
                                    if (latestBuildCodeCoverage < 70) {
                                        return "#FFCC00;"
                                    } else {
                                        return "green";
                                    }
                                });

                                let coverageDiffFormatted = "";
                                if (codeCoverageDiff < 0) {
                                    coverageDiffFormatted = `- ${codeCoverageDiff.toFixed(2)}%`;
                                } else {
                                    coverageDiffFormatted = `+ ${codeCoverageDiff.toFixed(2)}%`;
                                };

                                let $codeCoverage = $('#code_coverage');
                                $codeCoverage.text(latestBuildCodeCoverage.toFixed(2) + "%");
                                let $codeCoverageDiff = $('#code_coverage_diff');
                                $codeCoverageDiff.text(coverageDiffFormatted).css('color', function () {
                                    if (codeCoverageDiff < 0) {
                                        return "red";
                                    } else {
                                        return "green";
                                    }
                                })
                                let $codeCoverageStatsContainer = $("#code_coverage_stats_container")
                                let $list = $('<ul>');
                                $list.append($('<li>').text("Lines covered: " + latestBuildLinesCovered + " (+" + coveredLinesDiff + " lines)"));
                                $list.append($('<li>').text("Lines total: " + latestBuildLinesTotal + " (+" + totalLinesDiff + " lines)"));
                                $list.append($('<li><a href="' + buildUrl + ' "target="_blank">' + "More details" + '</a>'))
                                $list.css({ 'list-style-type': 'none', 'padding-top': '0', 'margin-left': '0', 'font-size': '12px' })
                                $codeCoverageStatsContainer.append($list)
                            });
                            return latestBuildCodeCoverageData
                        });
                        return compare;
                    });
                return WidgetHelpers.WidgetStatusHelper.Success();
            };
            return {
                load: function (widgetSettings) {
                    return getCodeCoverage(widgetSettings);
                },
                reload: function (widgetSettings) {
                    return qetQueryInfo(widgetSettings);
                }
            }
        });
        VSS.notifyLoadSucceeded();
    });

async function getCodeCoverageForBuild(projectId, buildId, testClient) {
    const resposne = await testClient.getCodeCoverageSummary(projectId, buildId);
    const coverageData = await resposne.coverageData
    return coverageData
}

