import React, { useState } from 'react';
import classes from './PolicyEditor.module.css';
import { ExpandablePolicyCard } from 'resourceadm/components/PolicyEditor/ExpandablePolicyCard';
import { CardButton } from 'resourceadm/components/PolicyEditor/CardButton';
import { Button } from '@digdir/design-system-react';
import {
  PolicyBackendType,
  PolicyRuleCardType,
  PolicyRuleBackendType,
  PolicySubjectType,
  RequiredAuthLevelType,
  PolicyActionType,
} from 'resourceadm/types/global';
import {
  mapPolicyRulesBackendObjectToPolicyRuleCardType,
  emptyPolicyRule,
  mapPolicyRuleToPolicyRuleBackendObject,
} from 'resourceadm/utils/policyEditorUtils';
import { VerificationModal } from 'resourceadm/components/VerificationModal';
import { SelectAuthLevel } from 'resourceadm/components/SelectAuthLevel';

interface Props {
  policy: PolicyBackendType;
  actions: PolicyActionType[];
  subjects: PolicySubjectType[];
  resourceType: string;
  resourceId: string;
  onSave: (policy: PolicyBackendType) => void;
}
/**
 * Displays the content where a user can add and edit a policy
 *
 * @param props.policy the policy to edit
 * @param props.actions a list of actions that can be used in the rules
 * @param props.subjects a list of subjects that be can selected in the rules
 * @param props.resourceType the type of the resource so that it can fill the autogenerated field for the first resource
 * @param props.resourceId the ID of the resource so that it can fill the autogenerated field for the first resource
 * @param props.onSave function that saves the policy
 */
export const PolicyEditor = ({
  policy,
  actions,
  subjects,
  resourceType,
  resourceId,
  onSave,
}: Props) => {
  // TODO - translation

  const [policyRules, setPolicyRules] = useState<PolicyRuleCardType[]>(
    mapPolicyRulesBackendObjectToPolicyRuleCardType(subjects, actions, policy.rules)
  );
  const [requiredAuthLevel, setRequiredAuthLevel] = useState<RequiredAuthLevelType>(
    policy.requiredAuthenticationLevelEndUser
  );

  // Handle the new updated IDs of the rules when a rule is deleted / duplicated
  const [lastRuleId, setLastRuleId] = useState(policy.rules.length + 1);

  const [verificationModalOpen, setVerificationModalOpen] = useState(false);

  // To keep track of which rule to delete
  const [ruleIdToDelete, setRuleIdToDelete] = useState('0');

  /**
   * Displays all the rule cards
   */
  const displayRules = policyRules.map((pr, i) => {
    return (
      <div className={classes.space} key={i}>
        <ExpandablePolicyCard
          policyRule={pr}
          actions={actions}
          subjects={subjects}
          rules={policyRules}
          setPolicyRules={setPolicyRules}
          resourceId={resourceId}
          resourceType={resourceType}
          handleDuplicateRule={() => handleDuplicateRule(i)}
          handleDeleteRule={() => {
            setVerificationModalOpen(true);
            setRuleIdToDelete(pr.ruleId);
          }}
        />
      </div>
    );
  });

  /**
   * Returns the rule ID to be used on the new element, and
   * updates the store of the next rule id
   */
  const getRuleId = () => {
    const currentRuleId = lastRuleId;
    setLastRuleId(currentRuleId + 1);
    return currentRuleId;
  };

  /**
   * Handles adding of more cards
   */
  const handleAddCardClick = () => {
    setPolicyRules((prevRules) => [
      ...prevRules,
      ...[
        {
          ...emptyPolicyRule,
          ruleId: getRuleId().toString(),
          resources: [[{ type: resourceType, id: resourceId }]],
        },
      ],
    ]);
  };

  /**
   * Duplicates a rule with all the content in it
   *
   * @param index the index of the rule to duplicate
   */
  const handleDuplicateRule = (index: number) => {
    const ruleToDuplicate: PolicyRuleCardType = {
      ...policyRules[index],
      ruleId: getRuleId().toString(),
    };
    setPolicyRules([...policyRules, ruleToDuplicate]);
  };

  /**
   * Deletes a rule from the list
   *
   * @param index the index of the rule to delete
   */
  const handleDeleteRule = (ruleId: string) => {
    const updatedRules = [...policyRules];
    const indexToRemove = updatedRules.findIndex((a) => a.ruleId === ruleId);
    updatedRules.splice(indexToRemove, 1);
    setPolicyRules(updatedRules);

    // Reset
    setVerificationModalOpen(false);
    setRuleIdToDelete('0');

    handleSavePolicy(updatedRules);
  };

  /**
   * Handle the saving of the updated policy
   */
  const handleSavePolicy = (rules: PolicyRuleCardType[]) => {
    const policyEditorRules: PolicyRuleBackendType[] = rules.map((pr) =>
      mapPolicyRuleToPolicyRuleBackendObject(subjects, actions, pr, resourceType, resourceId)
    );

    const updatedPolicy: PolicyBackendType = {
      rules: policyEditorRules,
      requiredAuthenticationLevelEndUser: requiredAuthLevel,
      requiredAuthenticationLevelOrg: '3',
    };
    onSave(updatedPolicy);
  };

  return (
    <div>
      <div className={classes.policyEditorTop}>
        <h1 className={classes.policyEditorHeader}>Policy editor</h1>
        <h2 className={classes.subHeader}>Navn på ressursen</h2>
        <div className={classes.textFieldIdWrapper}>
          <div className={classes.idBox}>
            <p className={classes.idBoxText}>id</p>
          </div>
          <p className={classes.idText}>{resourceId}</p>
        </div>
      </div>
      <div className={classes.selectAuthLevelWrapper}>
        <h2 className={classes.subHeader}>Velg påkrevd sikkerhetsnivå for bruker</h2>
        <div className={classes.selectAuthLevel}>
          <SelectAuthLevel
            value={requiredAuthLevel}
            setValue={(v) => setRequiredAuthLevel(v)}
            label='Velg påkrevd sikkerhetsnivå for bruker'
          />
        </div>
      </div>
      <h2 className={classes.subHeader}>Regler for policyen</h2>
      {displayRules}
      <div className={classes.addCardButtonWrapper}>
        <CardButton buttonText='Legg til ekstra regelsett' onClick={handleAddCardClick} />
      </div>
      <Button type='button' onClick={() => handleSavePolicy(policyRules)}>
        Lagre policyen
      </Button>
      <VerificationModal
        isOpen={verificationModalOpen}
        onClose={() => setVerificationModalOpen(false)}
        text='Er du sikker på at du vil slette denne regelen?'
        closeButtonText='Nei, gå tilbake'
        actionButtonText='Ja, slett regel'
        onPerformAction={() => handleDeleteRule(ruleIdToDelete)}
      />
    </div>
  );
};
