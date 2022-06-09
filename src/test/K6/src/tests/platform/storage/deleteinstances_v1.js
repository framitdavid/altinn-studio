/*
    Test data required: username and password, deployed app that requires level 2 login (reference app: ttd/apps-test)
    Command: docker-compose run k6 run /src/tests/platform/storage/deleteinstances_v1.js -e env=*** -e org=*** -e username=*** -e userpwd=*** -e level2app=*** -e appIds=org/app1,org/app2 -e appsaccesskey=*** -e sblaccesskey=***
*/

import { check } from 'k6';
import * as sbl from '../../../api/platform/storage/messageboxinstances.js';
import * as setUpData from '../../../setup.js';
import { addErrorCount } from '../../../errorcounter.js';
import * as instances from '../../../api/platform/storage/instances.js';

const userName = __ENV.username;
const userPassword = __ENV.userpwd;
const appOwner = __ENV.org;
const level2App = __ENV.level2app;
const environment = __ENV.env.toLowerCase();
let appIds = __ENV.appIds;

export const options = {
  thresholds: {
    errors: ['count<1'],
  },
};

//Function to setup data and return AltinnstudioRuntime Token and user details
export function setup() {
  var aspxauthCookie = setUpData.authenticateUser(userName, userPassword);
  var altinnStudioRuntimeCookie = setUpData.getAltinnStudioRuntimeToken(aspxauthCookie);
  var data = setUpData.getUserData(altinnStudioRuntimeCookie, appOwner, level2App);
  data.RuntimeToken = altinnStudioRuntimeCookie;
  setUpData.clearCookies();
  return data;
}

//Hard delete instances under a party id based on supplied appIds + level2app
export default function (data) {
  const runtimeToken = data['RuntimeToken'];

  const partyIds = [];
  partyIds.push(data['partyId']);
  //add party id of org for non prod environments
  if (environment != 'prod') partyIds.push(data['orgNumberPartyId']);

  var res, resBody, success, instanceIds;
  var instancesCount = 0;

  try {
    appIds = appIds.split(',');
    appIds.push(appOwner + '/' + level2App);
  } catch (error) {
    appIds = [];
    appIds.push(appOwner + '/' + level2App);
  }

  partyIds.forEach((partyId) => {
    //Find active instances under the party id to be deleted.
    var filters = {
      'instanceOwner.partyId': partyId,
      appId: appIds,
    };

    res = instances.getAllinstancesWithFilters(runtimeToken, filters);
    resBody = JSON.parse(res.body);
    instanceIds = resBody.instances.map((i) => i.id);
    instancesCount = instanceIds.count;

    do {
      if (instancesCount > 0) {
        sbl.hardDeleteManyInstances(runtimeToken, instanceIds);

        //Find more instances to loop through
        res = instances.getAllinstancesWithFilters(runtimeToken, filters);
        resBody = JSON.parse(res.body);
        instanceIds = resBody.instances.map((i) => i.id);
        instancesCount = instanceIds.count;
      }
    } while (instancesCount > 0);

    success = check(instancesCount, {
      'Hard delete instances for party. Remaining instance count is 0': (c) => c === 0,
    });
    addErrorCount(success);
  });
}
