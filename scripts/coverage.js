VSS.init({
    explicitNotifyLoaded: true,
    usePlatformStyles: true
});

VSS.require(["TFS/Dashboards/WidgetHelpers", "TFS/TestManagement/RestClient", "TFS/Build/RestClient"],
    function (WidgetHelpers, TFS_Test_Api, TFS_Build_Api) {
        WidgetHelpers.IncludeWidgetStyles();
        VSS.register("NGTCoverageWidget", function () {
            const projectId = VSS.getWebContext().project.id;
            const pipelineId = 105700;
            const definitionIds = [417];
            
            return {
                load: function (ngtWidget) {
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
                                    $title.text('NGT Code Coverage');

                                    let $codeCoverageContainer = $('#code_coverage_container');
                                    $codeCoverageContainer.css('backgroundColor', function () {
                                        if (latestBuildCodeCoverage < 70) {
                                            return "yellow"
                                        } else {
                                            return "green"
                                        }
                                    });

                                    let $codeCoverage = $('#code_coverage')
                                    $codeCoverage.text(codeCoverageDiff.toFixed(2))
                                    let $codeCoverageDiff = $('#code_coverage_diff')
                                    $codeCoverageDiff.text(codeCoverageDiff.toFixed(3))

                                    let $codeCoverageStatsContainer = $("#code_coverage_stats_container")
                                    let $list = $('<ul>');
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
    const resposne = await testClient.getCodeCoverageSummary(projectId, buildId)
    const coverageData = await resposne.coverageData
    return coverageData
}

