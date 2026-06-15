import React, { useState, useCallback, useMemo, useRef } from 'react';
import {
  Button,
  Checkbox,
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
const uid = () => `cgr_${++_idCounter}`;

function parseJSON(str, fallback) {
  if (!str || !str.trim()) return fallback;
  try {
    return JSON.parse(str);
  } catch {
    return fallback;
  }
}

function buildRows(ratioStr, usableStr) {
  const ratioMap = parseJSON(ratioStr, {});
  const usableMap = parseJSON(usableStr, {});
  const allNames = new Set([...Object.keys(ratioMap), ...Object.keys(usableMap)]);
  return Array.from(allNames).map((name) => ({
    _id: uid(),
    name,
    ratio: typeof ratioMap[name] === 'number' ? ratioMap[name] : 1,
    selectable: name in usableMap,
    description: usableMap[name] ?? '',
  }));
}

export function serializeChannelGroupRatio(rows) {
  const channelGroupRatio = {};
  const userUsableGroups = {};
  rows.forEach((row) => {
    if (!row.name) return;
    channelGroupRatio[row.name] = row.ratio;
    if (row.selectable) {
      userUsableGroups[row.name] = row.description;
    }
  });
  return {
    ChannelGroupRatio: JSON.stringify(channelGroupRatio, null, 2),
    UserUsableGroups: JSON.stringify(userUsableGroups, null, 2),
  };
}

export default function ChannelGroupRatioTable({ channelGroupRatio, userUsableGroups, onChange }) {
  const { t } = useTranslation();
  const [rows, setRows] = useState(() => buildRows(channelGroupRatio, userUsableGroups));
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const emitAndSet = useCallback((updater) => {
    setRows((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      onChangeRef.current?.(serializeChannelGroupRatio(next));
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
      let newName = `channel_group_${counter}`;
      while (existingNames.has(newName)) {
        counter++;
        newName = `channel_group_${counter}`;
      }
      return [...prev, { _id: uid(), name: newName, ratio: 1, selectable: true, description: '' }];
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
        title: t('渠道分组名称'),
        dataIndex: 'name',
        key: 'name',
        width: 160,
        render: (_, record) => (
          <Input
            size='small'
            value={record.name}
            onChange={(v) => updateRow(record._id, 'name', v)}
          />
        ),
      },
      {
        title: t('倍率'),
        dataIndex: 'ratio',
        key: 'ratio',
        width: 120,
        render: (_, record) => (
          <InputNumber
            size='small'
            min={0}
            step={0.1}
            value={record.ratio}
            style={{ width: '100%' }}
            onChange={(v) => updateRow(record._id, 'ratio', v ?? 1)}
          />
        ),
      },
      {
        title: t('用户可选'),
        dataIndex: 'selectable',
        key: 'selectable',
        width: 80,
        align: 'center',
        render: (_, record) => (
          <Checkbox
            checked={record.selectable}
            onChange={(e) => updateRow(record._id, 'selectable', e.target.checked)}
          />
        ),
      },
      {
        title: t('描述'),
        dataIndex: 'description',
        key: 'description',
        render: (_, record) =>
          record.selectable ? (
            <Input
              size='small'
              value={record.description}
              placeholder={t('分组描述')}
              onChange={(v) => updateRow(record._id, 'description', v)}
            />
          ) : (
            <Text type='tertiary' size='small'>-</Text>
          ),
      },
      {
        title: '',
        key: 'actions',
        width: 50,
        render: (_, record) => (
          <Popconfirm
            title={t('确认删除该渠道分组？')}
            onConfirm={() => removeRow(record._id)}
            position='left'
          >
            <Button icon={<IconDelete />} type='danger' theme='borderless' size='small' />
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
        empty={<Text type='tertiary'>{t('暂无渠道分组，点击下方按钮添加')}</Text>}
      />
      <div className='mt-3 flex justify-center'>
        <Button icon={<IconPlus />} theme='outline' onClick={addRow}>
          {t('添加渠道分组')}
        </Button>
      </div>
    </div>
  );
}

import { IconPlus, IconDelete } from '@douyinfe/semi-icons';
import { useTranslation } from 'react-i18next';
import CardTable from '../../../../components/common/ui/CardTable';

const { Text } = Typography;

let _idCounter = 0;
const uid = () => `cgr_${++_idCounter}`;

function parseJSON(str, fallback) {
  if (!str || !str.trim()) return fallback;
  try {
    return JSON.parse(str);
  } catch {
    return fallback;
  }
}

function buildRows(ratioStr) {
  const ratioMap = parseJSON(ratioStr, {});
  return Object.entries(ratioMap).map(([name, ratio]) => ({
    _id: uid(),
    name,
    ratio: typeof ratio === 'number' ? ratio : 1,
  }));
}

export function serializeChannelGroupRatio(rows) {
  const result = {};
  rows.forEach((row) => {
    if (!row.name) return;
    result[row.name] = row.ratio;
  });
  return JSON.stringify(result, null, 2);
}

export default function ChannelGroupRatioTable({ value, onChange }) {
  const { t } = useTranslation();
  const [rows, setRows] = useState(() => buildRows(value));
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const emitAndSet = useCallback((updater) => {
    setRows((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      onChangeRef.current?.(serializeChannelGroupRatio(next));
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
      let newName = `channel_group_${counter}`;
      while (existingNames.has(newName)) {
        counter++;
        newName = `channel_group_${counter}`;
      }
      return [...prev, { _id: uid(), name: newName, ratio: 1 }];
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
        title: t('渠道分组名称'),
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
        title: t('倍率'),
        dataIndex: 'ratio',
        key: 'ratio',
        width: 160,
        render: (_, record) => (
          <InputNumber
            size='small'
            min={0}
            step={0.1}
            value={record.ratio}
            style={{ width: '100%' }}
            onChange={(v) => updateRow(record._id, 'ratio', v ?? 1)}
          />
        ),
      },
      {
        title: '',
        key: 'actions',
        width: 50,
        render: (_, record) => (
          <Popconfirm
            title={t('确认删除该渠道分组倍率？')}
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
            {t('暂无渠道分组倍率，点击下方按钮添加')}
          </Text>
        }
      />
      <div className='mt-3 flex justify-center'>
        <Button icon={<IconPlus />} theme='outline' onClick={addRow}>
          {t('添加渠道分组')}
        </Button>
      </div>
    </div>
  );
}
