/*
Copyright (C) 2025 QuantumNous

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.

For commercial licensing, please contact support@quantumnous.com
*/

import React from 'react';
import { Modal } from '@douyinfe/semi-ui';

const BatchDeleteModal = ({ visible, onCancel, deleteType, batchDeleteUsers, refresh, t }) => {
  const isDisabled = deleteType === 'disabled';
  const title = isDisabled
    ? t('确定要永久删除所有已禁用用户吗？')
    : t('确定要永久删除所有已注销用户吗？');
  const description = isDisabled
    ? t('此操作将永久删除所有状态为"已禁用"的用户及其账号信息，不可恢复。')
    : t('此操作将永久删除所有已注销用户的账号信息，不可恢复。');

  const handleConfirm = async () => {
    await batchDeleteUsers(deleteType);
    await refresh();
    onCancel();
  };

  return (
    <Modal
      title={title}
      visible={visible}
      onCancel={onCancel}
      onOk={handleConfirm}
      type='danger'
    >
      {description}
    </Modal>
  );
};

export default BatchDeleteModal;
