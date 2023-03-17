import { Injectable } from '@nestjs/common';
// import axios, { AxiosInstance } from 'axios';
import { PokemonsResponse } from './interfaces/pokemons-response.model';
import { CreatePokemonDto } from 'src/pokemon/dto/create-pokemon.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Pokemon } from '../pokemon/entities/pokemon.entity';
import { Model } from 'mongoose';
import { AxiosAdapter } from '../common/adapters/axios.adapters';

@Injectable()
export class SeedService {
  // private readonly axios: AxiosInstance = axios;

  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>,
    private readonly http: AxiosAdapter,
  ) {}

  async executeSeed() {
    await this.pokemonModel.deleteMany();
    const data = await this.http.get<PokemonsResponse>(
      'https://pokeapi.co/api/v2/pokemon?limit=650',
    );
    // let pokemonPromise = [];
    // data.results.forEach(({ name, url }) => {
    //   const segments = url.split('/');
    //   const no = +segments[segments.length - 2];
    //   pokemonPromise.push(this.pokemonModel.create({ name, no }));
    // });
    // const pokemons = await Promise.all(pokemonPromise);

    let pokemons: CreatePokemonDto[] = [];
    data.results.forEach(({ name, url }) => {
      const segments = url.split('/');
      const no = +segments[segments.length - 2];
      pokemons.push({ name, no });
    });
    await this.pokemonModel.insertMany(pokemons);

    return 'Seed execute';
  }
}
