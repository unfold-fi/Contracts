/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import {
  ethers,
  EventFilter,
  Signer,
  BigNumber,
  BigNumberish,
  PopulatedTransaction,
  Contract,
  ContractTransaction,
  Overrides,
  CallOverrides,
} from "ethers";
import { BytesLike } from "@ethersproject/bytes";
import { Listener, Provider } from "@ethersproject/providers";
import { FunctionFragment, EventFragment, Result } from "@ethersproject/abi";
import { TypedEventFilter, TypedEvent, TypedListener } from "./commons";

interface TokenVestingInterface extends ethers.utils.Interface {
  functions: {
    "beneficiary()": FunctionFragment;
    "cliff()": FunctionFragment;
    "duration()": FunctionFragment;
    "releasable(address)": FunctionFragment;
    "release(address)": FunctionFragment;
    "released(address)": FunctionFragment;
    "start()": FunctionFragment;
  };

  encodeFunctionData(
    functionFragment: "beneficiary",
    values?: undefined
  ): string;
  encodeFunctionData(functionFragment: "cliff", values?: undefined): string;
  encodeFunctionData(functionFragment: "duration", values?: undefined): string;
  encodeFunctionData(functionFragment: "releasable", values: [string]): string;
  encodeFunctionData(functionFragment: "release", values: [string]): string;
  encodeFunctionData(functionFragment: "released", values: [string]): string;
  encodeFunctionData(functionFragment: "start", values?: undefined): string;

  decodeFunctionResult(
    functionFragment: "beneficiary",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "cliff", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "duration", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "releasable", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "release", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "released", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "start", data: BytesLike): Result;

  events: {
    "TokensReleased(address,uint256)": EventFragment;
  };

  getEvent(nameOrSignatureOrTopic: "TokensReleased"): EventFragment;
}

export class TokenVesting extends Contract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  listeners<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter?: TypedEventFilter<EventArgsArray, EventArgsObject>
  ): Array<TypedListener<EventArgsArray, EventArgsObject>>;
  off<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter: TypedEventFilter<EventArgsArray, EventArgsObject>,
    listener: TypedListener<EventArgsArray, EventArgsObject>
  ): this;
  on<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter: TypedEventFilter<EventArgsArray, EventArgsObject>,
    listener: TypedListener<EventArgsArray, EventArgsObject>
  ): this;
  once<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter: TypedEventFilter<EventArgsArray, EventArgsObject>,
    listener: TypedListener<EventArgsArray, EventArgsObject>
  ): this;
  removeListener<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter: TypedEventFilter<EventArgsArray, EventArgsObject>,
    listener: TypedListener<EventArgsArray, EventArgsObject>
  ): this;
  removeAllListeners<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter: TypedEventFilter<EventArgsArray, EventArgsObject>
  ): this;

  listeners(eventName?: string): Array<Listener>;
  off(eventName: string, listener: Listener): this;
  on(eventName: string, listener: Listener): this;
  once(eventName: string, listener: Listener): this;
  removeListener(eventName: string, listener: Listener): this;
  removeAllListeners(eventName?: string): this;

  queryFilter<EventArgsArray extends Array<any>, EventArgsObject>(
    event: TypedEventFilter<EventArgsArray, EventArgsObject>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TypedEvent<EventArgsArray & EventArgsObject>>>;

  interface: TokenVestingInterface;

  functions: {
    beneficiary(overrides?: CallOverrides): Promise<[string]>;

    "beneficiary()"(overrides?: CallOverrides): Promise<[string]>;

    cliff(overrides?: CallOverrides): Promise<[BigNumber]>;

    "cliff()"(overrides?: CallOverrides): Promise<[BigNumber]>;

    duration(overrides?: CallOverrides): Promise<[BigNumber]>;

    "duration()"(overrides?: CallOverrides): Promise<[BigNumber]>;

    releasable(token: string, overrides?: CallOverrides): Promise<[BigNumber]>;

    "releasable(address)"(
      token: string,
      overrides?: CallOverrides
    ): Promise<[BigNumber]>;

    release(
      token: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    "release(address)"(
      token: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    released(token: string, overrides?: CallOverrides): Promise<[BigNumber]>;

    "released(address)"(
      token: string,
      overrides?: CallOverrides
    ): Promise<[BigNumber]>;

    start(overrides?: CallOverrides): Promise<[BigNumber]>;

    "start()"(overrides?: CallOverrides): Promise<[BigNumber]>;
  };

  beneficiary(overrides?: CallOverrides): Promise<string>;

  "beneficiary()"(overrides?: CallOverrides): Promise<string>;

  cliff(overrides?: CallOverrides): Promise<BigNumber>;

  "cliff()"(overrides?: CallOverrides): Promise<BigNumber>;

  duration(overrides?: CallOverrides): Promise<BigNumber>;

  "duration()"(overrides?: CallOverrides): Promise<BigNumber>;

  releasable(token: string, overrides?: CallOverrides): Promise<BigNumber>;

  "releasable(address)"(
    token: string,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  release(
    token: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  "release(address)"(
    token: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  released(token: string, overrides?: CallOverrides): Promise<BigNumber>;

  "released(address)"(
    token: string,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  start(overrides?: CallOverrides): Promise<BigNumber>;

  "start()"(overrides?: CallOverrides): Promise<BigNumber>;

  callStatic: {
    beneficiary(overrides?: CallOverrides): Promise<string>;

    "beneficiary()"(overrides?: CallOverrides): Promise<string>;

    cliff(overrides?: CallOverrides): Promise<BigNumber>;

    "cliff()"(overrides?: CallOverrides): Promise<BigNumber>;

    duration(overrides?: CallOverrides): Promise<BigNumber>;

    "duration()"(overrides?: CallOverrides): Promise<BigNumber>;

    releasable(token: string, overrides?: CallOverrides): Promise<BigNumber>;

    "releasable(address)"(
      token: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    release(token: string, overrides?: CallOverrides): Promise<void>;

    "release(address)"(token: string, overrides?: CallOverrides): Promise<void>;

    released(token: string, overrides?: CallOverrides): Promise<BigNumber>;

    "released(address)"(
      token: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    start(overrides?: CallOverrides): Promise<BigNumber>;

    "start()"(overrides?: CallOverrides): Promise<BigNumber>;
  };

  filters: {
    TokensReleased(
      token: null,
      amount: null
    ): TypedEventFilter<
      [string, BigNumber],
      { token: string; amount: BigNumber }
    >;
  };

  estimateGas: {
    beneficiary(overrides?: CallOverrides): Promise<BigNumber>;

    "beneficiary()"(overrides?: CallOverrides): Promise<BigNumber>;

    cliff(overrides?: CallOverrides): Promise<BigNumber>;

    "cliff()"(overrides?: CallOverrides): Promise<BigNumber>;

    duration(overrides?: CallOverrides): Promise<BigNumber>;

    "duration()"(overrides?: CallOverrides): Promise<BigNumber>;

    releasable(token: string, overrides?: CallOverrides): Promise<BigNumber>;

    "releasable(address)"(
      token: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    release(
      token: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    "release(address)"(
      token: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    released(token: string, overrides?: CallOverrides): Promise<BigNumber>;

    "released(address)"(
      token: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    start(overrides?: CallOverrides): Promise<BigNumber>;

    "start()"(overrides?: CallOverrides): Promise<BigNumber>;
  };

  populateTransaction: {
    beneficiary(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    "beneficiary()"(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    cliff(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    "cliff()"(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    duration(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    "duration()"(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    releasable(
      token: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    "releasable(address)"(
      token: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    release(
      token: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    "release(address)"(
      token: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    released(
      token: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    "released(address)"(
      token: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    start(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    "start()"(overrides?: CallOverrides): Promise<PopulatedTransaction>;
  };
}
