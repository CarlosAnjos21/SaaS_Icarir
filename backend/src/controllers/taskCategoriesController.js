const prisma = require("../config/prismaClient");
const { Prisma } = require("@prisma/client");

const getAllTaskCategories = async (req, res) => {
  try {
    const categories = await prisma.categoriaTarefa.findMany({
      orderBy: { ordem: "asc" },
      include: {
        tarefas: { where: { ativa: true }, orderBy: { ordem: "asc" } },
      },
    });
    res.json(categories);
  } catch (error) {
    console.error("Error fetching task categories:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};

const getTaskCategoryById = async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ error: "Invalid ID." });

  try {
    const category = await prisma.categoriaTarefa.findUnique({
      where: { id },
      include: {
        tarefas: { where: { ativa: true }, orderBy: { ordem: "asc" } },
      },
    });
    if (!category)
      return res.status(404).json({ error: "Category not found." });
    res.json(category);
  } catch (error) {
    console.error("Error fetching task category:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};

const createTaskCategory = async (req, res) => {
  const { nome, descricao, icone, cor, ordem } = req.body;
  if (!nome) return res.status(400).json({ error: '"nome" is required.' });

  try {
    const category = await prisma.categoriaTarefa.create({
      data: {
        nome,
        descricao: descricao || null,
        icone: icone || null,
        cor: cor || null,
        ordem: ordem ? parseInt(ordem, 10) : 0,
      },
    });
    res
      .status(201)
      .json({ message: "Category created successfully!", category });
  } catch (error) {
    console.error("Error creating task category:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};

const updateTaskCategory = async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ error: "Invalid ID." });

  const { nome, descricao, icone, cor, ordem } = req.body;
  const data = {
    ...(nome !== undefined && { nome }),
    ...(descricao !== undefined && { descricao }),
    ...(icone !== undefined && { icone }),
    ...(cor !== undefined && { cor }),
    ...(ordem !== undefined && { ordem: parseInt(ordem, 10) }),
  };

  try {
    const category = await prisma.categoriaTarefa.update({
      where: { id },
      data,
    });
    res.json({ message: "Category updated successfully!", category });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return res.status(404).json({ error: "Category not found." });
    }
    console.error("Error updating task category:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};

const deleteTaskCategory = async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ error: "Invalid ID." });

  try {
    await prisma.categoriaTarefa.delete({ where: { id } });
    res.json({ message: "Category deleted successfully!" });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2003")
        return res
          .status(409)
          .json({ error: "There are tasks linked to this category." });
      if (error.code === "P2025")
        return res.status(404).json({ error: "Category not found." });
    }
    console.error("Error deleting task category:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};

module.exports = {
  getAllTaskCategories,
  getTaskCategoryById,
  createTaskCategory,
  updateTaskCategory,
  deleteTaskCategory,
};
