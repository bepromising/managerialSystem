const class_sates = [
    {
        label: '启用',
        value: 1
    },
    {
        label: '停用',
        value: 0
    }
];

const role_types = [
    {
        label: '角色',
        value: '0'
    },
    {
        label: '部门',
        value: '1'
    },
    {
        label: '区域',
        value: '2'
    }
];

const childNodeFlags = [
    {
        label: '是',
        value: '1'
    },
    {
        label: '否',
        value: '0'
    }
]

const role_states = [
    {
        label: '启用',
        value: '1'
    },
    {
        label: '停用',
        value: '0'
    }
];

const class_types = [
    {
        label: '材料分类',
        value: '0'
    },
    {
        label: '优惠套餐分类',
        value: '1'
    },
    {
        label: '菜式搭配',
        value: '2'
    }
];

const goods_types = [
    {
        label: '普通商品',
        value: '0'
    },
    {
        label: '优惠套餐',
        value: '1'
    }
];

const user_state = [
    {
        label: '启用',
        value: '1'
    },
    {
        label: '停用',
        value: '0'
    }
];

const order_types = [
    {
        label: '未付款',
        value: '0'
    },
    {
        label: '已付款待确认',
        value: '1'
    },
    {
        label: '已确认待发货',
        value: '2'
    },
    {
        label: '已发货',
        value: '3'
    },
    {
        label: '交易完成',
        value: '5'
    },
    {
        label: '交易取消',
        value: '99'
    },
];

const user_types = [
    {
        label: '普通用户',
        value: '0'
    },
    {
        label: '运营人员',
        value: '1'
    },
]

export {
    class_sates,
    class_types,
    role_states,
    childNodeFlags,
    role_types,
    goods_types,
    user_state,
    order_types,
    user_types
}