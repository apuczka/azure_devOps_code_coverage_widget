
import { RestClient } from "TFS/TestManagement/RestClient"
import { BuildClient } from "TFS/Build/RestClient"
import { BuildQueryOrder } from "TFS/Build/Contracts"
var client = RestClient.getClient()
var buildClient = BuildClient.getClient()

var build = buildClient.getBuilds("projectId", [1234], null, null, null, null, null, null, "Completed", "Succeeded", null, null, null,1 , null, null, null, null, null)
build.then(b => {
    b.
})
var list = []
var buildsToCompare =  [list[0], list[1]]
var resposne = await client.getCodeCoverageSummary(projectId, buildsToCompare[i].id)
list.length