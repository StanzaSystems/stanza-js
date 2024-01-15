/* eslint-disable */
/*
 * Original file: https://github.com/open-telemetry/opentelemetry-js/blob/3e5929132129ed6022adbd05d085b998cb03e3d5/packages/opentelemetry-sdk-trace-base/src/platform/node/export/BatchSpanProcessor.ts
 *
 * This file was modified:
 * * change imports to import from @opentelemetry/sdk-trace-base and local BatchSpanProcessorBase version
 * */
/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { BatchSpanProcessorBase } from './BatchSpanProcessorBase';
import { BufferConfig } from '@opentelemetry/sdk-trace-base';

export class BatchSpanProcessor extends BatchSpanProcessorBase<BufferConfig> {
  protected onShutdown(): void {}
}
