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

import React, { useState } from 'react';
import { Button } from '@douyinfe/semi-ui';
import BatchDeleteModal from './modals/BatchDeleteModal';

const UsersActions = ({ setShowAddUser, batchDeleteUsers, refresh, t }) => {
  const [batchDeleteType, setBatchDeleteType] = useState(null);

  const handleAddUser = () => {
    setShowAddUser(true);
  };

  return (
    <>
      <div className='flex gap-2 w-full md:w-auto order-2 md:order-1 flex-wrap'>
        <Button className='w-full md:w-auto' onClick={handleAddUser} size='small'>
          {t('添加用户')}
        </Button>
        <Button
          className='w-full md:w-auto'
          type='danger'
          theme='light'
          size='small'
          onClick={() => setBatchDeleteType('disabled')}
        >
          {t('删除已禁用')}
        </Button>
        <Button
          className='w-full md:w-auto'
          type='danger'
          theme='light'
          size='small'
          onClick={() => setBatchDeleteType('cancelled')}
        >
          {t('删除已注销')}
        </Button>
      </div>

      <BatchDeleteModal
        visible={batchDeleteType !== null}
        onCancel={() => setBatchDeleteType(null)}
        deleteType={batchDeleteType}
        batchDeleteUsers={batchDeleteUsers}
        refresh={refresh}
        t={t}
      />
    </>
  );
};

export default UsersActions;
