import Form from 'determined-ui/Form';
import Input from 'determined-ui/Input';
import { Modal } from 'determined-ui/Modal';
import { useId } from 'react';

import { patchModelVersion } from 'services/api';
import { ModelVersion } from 'types';
import handleError from 'utils/error';

const FORM_ID = 'edit-model-version-form';

type FormInputs = {
  modelVersionName: string;
  description?: string;
};

interface Props {
  modelVersion: ModelVersion;
  fetchModelVersion: () => Promise<void>;
}

const ModelVersionEditModal = ({ modelVersion, fetchModelVersion }: Props): JSX.Element => {
  const idPrefix = useId();
  const [form] = Form.useForm<FormInputs>();

  const handleOk = async () => {
    const values = await form.validateFields();
    try {
      await patchModelVersion({
        body: {
          comment: values.description,
          modelName: modelVersion.model.id.toString(),
          name: values.modelVersionName,
        },
        modelName: modelVersion.model.id.toString(),
        versionNum: modelVersion.version,
      });

      await fetchModelVersion();
    } catch (e) {
      handleError(e, {
        publicSubject: 'Unable to edit model version',
        silent: false,
      });
    }
  };

  const handleClose = () => {
    form.resetFields();
  };

  return (
    <Modal
      size="small"
      submit={{ form: idPrefix + FORM_ID, handleError, handler: handleOk, text: 'Save' }}
      title="Edit Model Version"
      onClose={handleClose}>
      <Form autoComplete="off" form={form} id={idPrefix + FORM_ID} layout="vertical">
        <Form.Item
          initialValue={modelVersion.name || `Version ${modelVersion.version}`}
          label="Name"
          name="modelVersionName">
          <Input />
        </Form.Item>
        <Form.Item initialValue={modelVersion.comment} label="Description" name="description">
          <Input.TextArea />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ModelVersionEditModal;
