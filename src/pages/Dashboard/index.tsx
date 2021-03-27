import { useEffect, useState } from 'react';

import Header from '../../components/Header';
import api from '../../services/api';
import Food from '../../components/Food';
import ModalAddFood from '../../components/ModalAddFood';
import ModalEditFood from '../../components/ModalEditFood';
import { FoodsContainer } from './styles';

interface FoodAttr {
  id: string;
  image: string;
  name: string;
  description: string;
  price: string;
  available: boolean;
}

export default function Dashboard() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [foods, setFoods] = useState<FoodAttr[]>([]);
  const [editingFood, setEditingFood] = useState<FoodAttr>({} as FoodAttr);

  function toggleModal() {
    setModalOpen(!modalOpen);
  }

  function toggleEditModal() {
    setEditModalOpen(!editModalOpen);
  }

  async function handleAddFood(food: Omit<FoodAttr, 'id' | 'available'>): Promise<void> {
    try {
      const response = await api.post('/foods', {
        ...food,
        available: true,
      });

      setFoods(state => [...state, response.data]);
    } catch (err) {
      console.log(err);
    }
  }
  
  async function handleUpdateFood(food: Omit<FoodAttr, 'id' | 'available'>): Promise<void> {
    try {
      const foodUpdated = await api.put(
        `/foods/${editingFood.id}`,
        { ...editingFood, ...food },
      );

      const foodsUpdated = foods.map(f =>
        f.id !== foodUpdated.data.id ? f : foodUpdated.data,
      );

      setFoods(foodsUpdated);
    } catch (err) {
      console.log(err);
    }
  } 

  async function handleDeleteFood(id: string) {
    await api.delete(`/foods/${id}`);

    const foodsFiltered = foods.filter(food => food.id !== id);

    setFoods(foodsFiltered);
  }

  function handleEditFood(food: FoodAttr) {
    setEditingFood(food);
    setEditModalOpen(true);
  }
    
  useEffect(() => {
    async function loadFoods() {
      const response = await api.get<FoodAttr[]>('/foods');

      setFoods(response.data);
    }

    loadFoods();
  }, []);

  return (
    <>
      <Header openModal={toggleModal} />
      <ModalAddFood
        isOpen={modalOpen}
        setIsOpen={toggleModal}
        handleAddFood={handleAddFood}
      />
      <ModalEditFood
        isOpen={editModalOpen}
        setIsOpen={toggleEditModal}
        editingFood={editingFood}
        handleUpdateFood={handleUpdateFood}
      />

      <FoodsContainer data-testid="foods-list">
        {foods &&
          foods.map(food => (
            <Food
              key={food.id}
              food={food}
              handleDelete={handleDeleteFood}
              handleEditFood={handleEditFood}
            />
          ))}
      </FoodsContainer>
    </>
  )
}
