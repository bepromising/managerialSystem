/**
 * 克隆不带function值的object和array
 * @param {object|array} obj 
 */
const clone = function (obj) {
    let jsonString = JSON.stringify(obj);
    return JSON.parse(jsonString);
};
/**
 * 
 * @param {array} nodes 需解析成树的数组
 * @param {string|number} pid 树的最顶层id，默认是'0'
 * @param {string|number} parentId，父节点的名称，默认是parentId
 * @returns array
 * @example parseTree(data); //如果最顶层的id是0
 */
const parseTreeNode = function(nodes, pid='0', parentId = 'parentId', id = 'id') {
    let finalNodes = [],
        tempNode;
    for (let i = 0, len = nodes.length; i < len; i++) {
        if (nodes[i][parentId] == pid) {
            let _node = nodes[i];
            tempNode = parseTreeNode(nodes, nodes[i][id], parentId, id);
            if (tempNode.length > 0) {
                _node.children = tempNode;
            }
            finalNodes.push(_node);
        } else {
            continue;
        }
    }
    return finalNodes;
};
/**
 * 
 * @param {array} nodes 需要解析成树的数组
 * @param {object} options 解析过程的配置，
 *                 {string}options.parentKey 父节点的字段名，默认parentId
 *                 {string}options.idKey 子节点的字段名，默认id
 *                 {string}options.childrenKey 直接子节点的键值，默认是children
 *                 {string}options.processMap 需要处理的键值，目前只支持number，使用parseFloat处理数据 
 * @param {string|number} pid 父节点的值
 * @returns array
 * @example parseTreeByMap(nodes,'0',{
 *      idKey:'id',
 *      parentKey:'parentId'
 * });
 */
const parseTreeByMap = function(nodes, pid, options) {
    let finalNodes = [],
        tempNode,
        finalOptions = Object.assign(
            {
                parentKey: 'parentId',
                idKey: 'id',
                childrenKey: 'children',
                processMap: {}
            },
            options
        );
    for (let i = 0, len = nodes.length; i < len; i++) {
        if (nodes[i][finalOptions.parentKey] == pid) {
            let _node = {};
            for (let key in finalOptions.map) {
                if (key in finalOptions.childrenKey) {
                    switch (finalOptions.childrenKey[key]) {
                        case 'number':
                            let nodeValue = nodes[i][key];
                            if (parseFloat(nodeValue)) {
                                _node[finalOptions.map[key]] = nodeValue;
                            }
                            break;
                    }
                } else {
                    _node[finalOptions.map[key]] = nodes[i][key];
                }
            }
            tempNode = parseTreeByMap(
                nodes,
                nodes[i][finalOptions.idKey],
                options
            );
            if (tempNode.length > 0) {
                _node[finalOptions.childrenKey] = tempNode;
            }
            finalNodes.push(_node);
        } else {
            continue;
        }
    }
    return finalNodes;
};
/**
 * 将带有${xxx}变量的字符串，按照data传入替换成最终的字符串
 * @param {string} template 带有${xxx}的字符串
 * @param {object} data {xxx:value}，将${xxx}替换成data.xxx 
 */
const parseTpl = function(template, data) {
    let reg = /\$\{\w+\}/;
    let result = template.match(reg);
    while (result) {
        let key = result[0],
            value = data[key.replace(/\$\{(\w+)\}/, '$1')];
        template = template.replace(key, value);
        result = template.match(reg);
    }
    return template;
};

export {
    clone,
    parseTpl,
    parseTreeByMap,
    parseTreeNode
};