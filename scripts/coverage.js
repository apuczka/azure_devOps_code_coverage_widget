VSS.init({
    explicitNotifyLoaded: true,
    usePlatformStyles: true
});

VSS.require(["TFS/Dashboards/WidgetHelpers", "TFS/TestManagement/RestClient", "TFS/Build/RestClient"],
    function (WidgetHelpers, TFS_Test_Api, TFS_Build_Api) {
        WidgetHelpers.IncludeWidgetStyles();
        VSS.register("NGTCoverageWidget", function () {
            var projectId = VSS.getWebContext().project.id;
            var pipelineId = 105700;
            var definitionIds = [];
            definitionIds.push(417);
            return {
                load: function (ngtWidget) {
                    var testClient = TFS_Test_Api.getClient();
                    var buildClient = TFS_Build_Api.getClient();
                    var buildsToCompare = [];

                    var buildList = buildClient.getBuilds(projectId, definitionIds, null, null, null, null, null, null, "Completed", "Succeeded", null, null, null, 2, null, null, null, null, null)
                    buildList.then(builds => {
                        buildsToCompare.push(builds[0]);
                        buildsToCompare.push(builds[1]);
                        return builds;
                    })
                        .then((compare) => {
                            buildsToCompare.sort((a, b) => b.finishTime - a.finishTime);
                            var latestBuild = buildsToCompare[0];
                            var latestBuildLinesCovered = 0
                            var latestBuildLinesTotal = 0
                            var latestBuildCodeCoverage = 0

                            var previousBuild = buildsToCompare[1];
                            var previousBuildLinesCovered = 0
                            var previousBuildLinesTotal = 0
                            var previousBuildCodeCoverage = 0


                            var latestBuildCodeCoverageData = getCodeCoverageForBuild(projectId, latestBuild.id, testClient);
                            var previousBuildCodeCoverageData = getCodeCoverageForBuild(projectId, previousBuild.id, testClient);

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

                                    var codeCoverageDiff = latestBuildCodeCoverage - previousBuildCodeCoverage;
                                    var coveredLinesDiff = latestBuildLinesCovered - previousBuildLinesCovered;
                                    var totalLinesDiff = latestBuildLinesTotal - previousBuildLinesTotal;

                                    var $title = $('h1.title');
                                    $title.text('NGT Code Coverage');

                                    var $codeCoverageContainer = $('#code_coverage_container');
                                    $codeCoverageContainer.css('backgroundColor', function () {
                                        if (latestBuildCodeCoverage < 70) {
                                            return "yellow"
                                        } else {
                                            return "green"
                                        }
                                    });

                                    var $codeCoverage = $('#code_coverage')
                                    $codeCoverage.text(codeCoverageDiff.toFixed(2))
                                    var $codeCoverageDiff = $('#code_coverage_diff')
                                    $codeCoverageDiff.text(codeCoverageDiff.toFixed(3))

                                    var $codeCoverageStatsContainer = $("#code_coverage_stats_container")
                                    var $list = $('<ul>');
                                    $list.append($('<li>').text("Pipeline id: " + pipelineId));
                                    $list.append($('<li>').text("Lines covered: " + latestBuildLinesCovered + " (+" + coveredLinesDiff + " lines)"));
                                    $list.append($('<li>').text("Lines total: " + latestBuildLinesTotal + " (+" + totalLinesDiff + " lines)"));
                                    $codeCoverageStatsContainer.append($list)
                                });
                                return latestBuildCodeCoverageData
                            })


                            return compare;
                        })
                    return WidgetHelpers.WidgetStatusHelper.Success();
                }
            }
        });
        VSS.notifyLoadSucceeded();
    });

async function getCodeCoverageForBuild(projectId, buildId, testClient) {
    var resposne = await testClient.getCodeCoverageSummary(projectId, buildId)
    var coverageData = await resposne.coverageData
    return coverageData
}

