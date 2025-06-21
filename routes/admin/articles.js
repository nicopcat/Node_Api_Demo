var express = require('express');
var router = express.Router();
const { Article } = require('../../models')
const { Op } = require('sequelize')
/* GET home page. */

// 查询文章列表
router.get('/', async function (req, res, next) {
  try {
    const query = req.query
    const { pageSize: ps, currentPage: cp } = query
    const currentPage = Math.abs(Number(cp)) || 1
    const pageSize = Math.abs(Number(ps)) || 10
    const condition = {
      order: [
        ['id', 'ASC']
      ],
      limit: pageSize,
      offset: (currentPage - 1) * pageSize,
    }
    // 查询条件
    if (query.title) {
      condition.where = {
        title: {
          [Op.like]: `%${query.title}%` // 模糊查询
        }
      }
    }
    const { rows, count } = await Article.findAndCountAll(condition)
    res.json({
      status: true,
      msg: '查询成功',
      data: {
        rows: rows,
        pagination: {
          total: count,
          currentPage: currentPage,
          pageSize: pageSize
        }
      }
    })
  } catch (error) {
    res.status(500).json({
      status: false,
      msg: '查询失败',
      data: {
        error: error.message
      }
    })
  }
});

// 查询某篇文章
router.get('/:id', async function (req, res, next) {
  const { id } = req.params
  try {
    const article = await Article.findByPk(id)
    if (!article) {
      return res.status(404).json({
        status: false,
        msg: '查询失败',
        data: {
          error: '文章不存在'
        }
      })
    }
    res.json({
      status: true,
      msg: '查询成功',
      data: {
        article
      }
    })
  } catch (error) {
    res.status(404).json({
      status: false,
      msg: '查询失败',
      data: {
        error: error.message
      }
    })
  }

});

// 新增文章
router.post('/', async function (req, res, next) {
  const { title, content } = req.body
  const article = await Article.create({
    title,
    content
  })
  res.json({
    status: true,
    msg: '新增成功',
    data: {
      article
    }
  })
})

// 更新文章
router.put('/:id', async function (req, res, next) {
  const { id } = req.params
  try {
    // 先查找
    const article = await Article.findByPk(id)
    if (!article) {
      res.status(404).json({
        status: false,
        msg: '更新失败',
        data: {
          error: '文章不存在'
        }
      })
    } else {
      await article.update(req.body)
      res.status(201).json({
        status: true,
        msg: '更新成功',
        data: null
      })
    }
  } catch (error) {
    res.status(500).json({
      status: false,
      msg: '更新失败',
      data: {
        error: error.message
      }
    })
  }
})

// 删除文章
router.delete('/:id', async function (req, res, next) {
  const { id } = req.params
  const article = await Article.findByPk(id)

  if (article) {
    await Article.destroy({
      where: {
        id: id
      }
    })
    res.json({
      status: true,
      msg: '删除成功',
      data: null
    })
  } else {
    res.status(404).json({
      status: false,
      msg: '删除失败',
      data: {
        error: '文章不存在'
      }
    })
  }
})

module.exports = router;
