import { useMutation, useQueryClient } from '@tanstack/react-query';
import { QueryKey } from 'app-shared/types/QueryKey';
import { useServicesContext } from 'app-shared/contexts/ServicesContext';
import type { UiSchemaNodes } from '@altinn/schema-model';
import { buildJsonSchema } from '@altinn/schema-model';
import { useParams } from 'react-router-dom';
import { useSchemaEditorAppContext } from '@altinn/schema-editor/hooks/useSchemaEditorAppContext';

export const useDatamodelMutation = () => {
  const queryClient = useQueryClient();
  const { org, app } = useParams<{ org: string; app: string }>();
  const { modelPath } = useSchemaEditorAppContext();
  const { saveDatamodel } = useServicesContext();
  return useMutation({
    mutationFn: (payload: UiSchemaNodes) => saveDatamodel(org, app, modelPath, buildJsonSchema(payload)).then(() => payload),
    onSuccess: async (payload: UiSchemaNodes) => {
      await Promise.all([
        queryClient.invalidateQueries([QueryKey.DatamodelsMetadata, org, app]),
        queryClient.invalidateQueries([QueryKey.JsonSchema, org, app, modelPath]),
      ]);
      queryClient.setQueryData(
        [QueryKey.Datamodel, org, app, modelPath],
        () => payload
      );
    }
  });
}
