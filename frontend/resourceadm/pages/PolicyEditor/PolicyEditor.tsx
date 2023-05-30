import React, { useEffect, useState } from 'react';
import classes from './PolicyEditor.module.css';
import { ExpandablePolicyCard } from 'resourceadm/components/ExpandablePolicyCard';
import { CardButton } from 'resourceadm/components/CardButton';
import { Button } from '@digdir/design-system-react';
import {
  PolicyEditorSendType,
  PolicyRuleCardType,
  PolicyRuleBackendType,
  PolicySubjectType,
} from 'resourceadm/types/global';
import { useLocation } from 'react-router-dom';
import {
  actionsListMock,
  policyMock1,
  policyMock2,
  subjectsListMock,
} from 'resourceadm/data-mocks/policies';
import {
  mapPolicyRulesBackendObjectToPolicyRuleCardType,
  emptyPolicyRule,
  mapPolicyRuleToPolicyRuleBackendObject,
} from 'resourceadm/utils/policyEditorUtils';

/**
 * Displays the content where a user can add and edit a policy
 */
export const PolicyEditor = () => {
  // TODO - translation
  // TODO - Make this component able to manage and control the values inside the cards

  const { state } = useLocation();

  // Set the resurceId sent in params or set it to null. If null, display error (TODO)
  const resourceId = state === null ? null : state.resourceId;
  const resourceType = state === null ? null : state.resourceType;

  // TODO - replace with list from backend
  const [actions, setActions] = useState<string[]>([]);
  const [subjects, setSubjects] = useState<PolicySubjectType[]>([]);

  // TODO - Make it possible to update values inside the rules tooo
  const [policyRules, setPolicyRules] = useState<PolicyRuleCardType[]>([]);

  // TODO - implement useOnce hook to get the policy
  useEffect(() => {
    // TODO - API Call to get the correct actions, AND TRANSLATE THEM
    setActions(actionsListMock);
    // TODO - API Call to get the correct subjects
    setSubjects(subjectsListMock);

    // TODO - API Call to get policy by the resource ID
    // TODO - Find out what the object sent from backend looks like
    setPolicyRules(
      mapPolicyRulesBackendObjectToPolicyRuleCardType(
        subjectsListMock,
        resourceId === 'test_id_1' ? policyMock1.Rules : policyMock2.Rules
      )
    );
  }, [resourceId]);

  /**
   * Displays all the rule cards
   */
  const displayRules = policyRules.map((pr, i) => (
    <div className={classes.space} key={i}>
      <ExpandablePolicyCard
        policyRule={pr}
        actions={actions}
        subjects={subjects}
        rules={policyRules}
        setPolicyRules={setPolicyRules}
        rulePosition={i}
      />
    </div>
  ));

  /**
   * Handles adding of more cards
   */
  const handleAddCardClick = () => {
    setPolicyRules((prevRules) => [
      ...prevRules,
      ...[
        {
          ...emptyPolicyRule,
          RuleId: (policyRules.length + 1).toString(),
          Resources: [{ type: resourceType, id: resourceId }],
        },
      ],
    ]);
  };

  /**
   * Handle the saving of the updated policy
   */
  const handleSavePolicy = () => {
    const policyEditorRules: PolicyRuleBackendType[] = policyRules.map((pr) =>
      mapPolicyRuleToPolicyRuleBackendObject(subjects, pr, resourceType, resourceId)
    );

    const resourceWithRules: PolicyEditorSendType = {
      Rules: policyEditorRules,
    };

    // TODO - Error handling

    console.log('Object to be sent as JSON object: \n', JSON.stringify(resourceWithRules, null, 2));
  };

  return (
    // TODO - display spinner when loading
    // TODO - display error if resourceId === null
    <div className={classes.policyEditorWrapper}>
      <div className={classes.policyEditorContainer}>
        <div className={classes.policyEditorTop}>
          <h2 className={classes.policyEditorHeader}>Policy editor</h2>
          <p>
            Endrer regler for policy med navn: <strong>{resourceId}</strong>
          </p>
        </div>
        <p className={classes.subHeader}>Se eller legg til regler for policyen</p>
        {displayRules}
        <div className={classes.space}>
          <CardButton buttonText='Legg til ekstra regelsett' onClick={handleAddCardClick} />
        </div>
        <Button
          type='button'
          onClick={() => {
            handleSavePolicy();
          }}
        >
          Lagre policyen
        </Button>
      </div>
    </div>
  );
};