import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { Model, isValidObjectId } from 'mongoose';
import { Pokemon } from './entities/pokemon.entity';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class PokemonService {
  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>,
  ) {}
  async create(createPokemonDto: CreatePokemonDto) {
    createPokemonDto.name = createPokemonDto.name.toLocaleLowerCase();
    try {
      const pokemon = await this.pokemonModel.create(createPokemonDto);
      return pokemon;
    } catch (error) {
      this.handleExeptions(error);
    }
  }

  async findAll() {
    const pokemons = await this.pokemonModel.find();
    return pokemons;
  }

  async findOne(search: string) {
    let pokemon: Pokemon;
    if (!isNaN(+search))
      pokemon = await this.pokemonModel.findOne({ no: search });
    if (!pokemon && isValidObjectId(search))
      pokemon = await this.pokemonModel.findById(search);
    if (!pokemon)
      pokemon = await this.pokemonModel.findOne({
        name: search.toLocaleLowerCase(),
      });
    if (!pokemon)
      throw new NotFoundException(
        `Pokemon with id, name or no "${search}" not found`,
      );
    return pokemon;
  }

  async update(search: string, updatePokemonDto: UpdatePokemonDto) {
    const pokemon = await this.findOne(search);
    if (updatePokemonDto.name)
      updatePokemonDto.name = updatePokemonDto.name.toLocaleLowerCase();
    try {
      await pokemon.updateOne(updatePokemonDto, { new: true });
      return { ...pokemon.toJSON(), ...updatePokemonDto };
    } catch (error) {
      this.handleExeptions(error);
    }
  }

  async remove(id: string) {
    // const deletedPokemon = await this.pokemonModel.findByIdAndDelete(id);
    const deletedPokemon = await this.pokemonModel.deleteOne({ _id: id });
    if (deletedPokemon.deletedCount === 0)
      throw new BadRequestException(`Pokemon with id "${id}" not found`);
    return;
  }

  private handleExeptions(error: any) {
    if (error.code === 11000) {
      throw new BadRequestException(
        `Pokemon exists in db ${JSON.stringify(error.keyValue)}`,
      );
    }
    throw new InternalServerErrorException(
      `Can't create pokemon - check server logs`,
    );
  }
}
