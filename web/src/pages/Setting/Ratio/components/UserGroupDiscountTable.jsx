import React, { useState, useCallback, useMemo, useRef } from 'react';
import {
  Button,
  Input,
  InputNumber,
  Typography,
  Popconfirm,
} from '@douyinfe/semi-ui';
import { IconPlus, IconDelete } from '@douyinfe/semi-icons';
import { useTranslation } from 'react-i18next';
import CardTable from '../../../../components/common/ui/CardTable';

const { Text } = Typography;

let _idCounter = 0;
const uid = () => `ugd_${++_idCounter}`;

function parseJSON(str, fallback) {
  if (!str || !str.trim()) return fallback;
  try {
    return JSON.parse(str);
  } catch {
    return fallback;
  }
}

function buildRows(discountStr) {
  const discountMap = parseJSON(discountStr, {});
  return Object.entries(discountMap).map(([name, discount]) => ({
    _id: uid(),
    name,
    discount: typeof discount === 'number' ? discount : 1,
  }));
}

export function serializeUserGroupDiscount(rows) {
  const result = {};
  rows.forEach((row) => {
    if (!row.name) return;
    result[row.name] = row.discount;
  });
  return JSON.stringify(result, null, 2);
}

export default function UserGroupDiscountTable({ value, onChange }) {
  const { t } = useTranslation();
  const [rows, setRows] = useState(() => buildRows(value));
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const emitAndSet = useCallback((updater) => {
    setRows((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      onChangeRef.current?.(serializeUserGroupDiscount(next));
      return next;
    });
  }, []);

  const updateRow = useCallback(
    (id, field, val) => {
      emitAndSet((prev) =>
        prev.map((r) => (r._id === id ? { ...r, [field]: val } : r)),
      );
    },
    [emitAndSet],
  );

  const addRow = useCallback(() => {
    emitAndSet((prev) => {
      const existingNames = new Set(prev.map((r) => r.name));
      let counter = 1;
      let newName = `sub_group_${counter}`;
      while (existingNames.has(newName)) {
        counter++;
        newName = `sub_group_${counter}`;
      }
      return [...prev, { _id: uid(), name: newName, discount: 1 }];
    });
  }, [emitAndSet]);

  const removeRow = useCallback(
    (id) => {
      emitAndSet((prev) => prev.filter((r) => r._id !== id));
    },
    [emitAndSet],
  );

  const columns = useMemo(
    () => [
      {
        title: t('订阅分组名称'),
        dataIndex: 'name',
        key: 'name',
        width: 200,
        render: (_, record) => (
          <Input
            size='small'
            value={record.name}
            onChange={(v) => updateRow(record._id, 'name', v)}
          />
        ),
      },
      {
        title: t('折扣倍率'),
        dataIndex: 'discount',
        key: 'discount',
        width: 160,
        render: (_, record) => (
          <InputNumber
            size='small'
            min={0}
            max={10}
            step={0.05}
            value={record.discount}
            style={{ width: '100%' }}
            onChange={(v) => updateRow(record._id, 'discount', v ?? 1)}
          />
        ),
      },
      {
        title: '',
        key: 'actions',
        width: 50,
        render: (_, record) => (
          <Popconfirm
            title={t('确认删除该订阅分组折扣？')}
            onConfirm={() => removeRow(record._id)}
            position='left'
          >
            <Button
              icon={<IconDelete />}
              type='danger'
              theme='borderless'
              size='small'
            />
          </Popconfirm>
        ),
      },
    ],
    [t, updateRow, removeRow],
  );

  return (
    <div>
      <CardTable
        columns={columns}
        dataSource={rows}
        rowKey='_id'
        hidePagination
        size='small'
        empty={
          <Text type='tertiary'>
            {t('暂无订阅分组折扣，点击下方按钮添加')}
          </Text>
        }
      />
      <div className='mt-3 flex justify-center'>
        <Button icon={<IconPlus />} theme='outline' onClick={addRow}>
          {t('添加订阅分组')}
        </Button>
      </div>
    </div>
  );
}
