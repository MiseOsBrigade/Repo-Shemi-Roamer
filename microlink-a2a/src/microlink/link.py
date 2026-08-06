from __future__ import annotations

from dataclasses import dataclass
import random


@dataclass(slots=True)
class LinkStats:
    frames_sent: int = 0
    bits_sent: int = 0
    bits_flipped: int = 0


class PhotonicLink:
    """Behavioral WDM link model.

    It models serialization time and optional independent bit errors. It does
    not model laser phase noise, ring drift, receiver equalization, or CDR.
    """

    def __init__(
        self,
        *,
        wavelengths: int = 4,
        lane_rate_bps: float = 10e9,
        bit_error_rate: float = 0.0,
        seed: int = 7,
    ) -> None:
        if wavelengths < 1:
            raise ValueError("wavelengths must be positive")
        if lane_rate_bps <= 0:
            raise ValueError("lane_rate_bps must be positive")
        if not 0.0 <= bit_error_rate <= 1.0:
            raise ValueError("bit_error_rate must be between 0 and 1")
        self.wavelengths = wavelengths
        self.lane_rate_bps = lane_rate_bps
        self.bit_error_rate = bit_error_rate
        self.stats = LinkStats()
        self._rng = random.Random(seed)

    @property
    def aggregate_rate_bps(self) -> float:
        return self.wavelengths * self.lane_rate_bps

    def serialization_delay_seconds(self, wire: bytes) -> float:
        return len(wire) * 8 / self.aggregate_rate_bps

    def transmit(self, wire: bytes) -> bytes:
        self.stats.frames_sent += 1
        self.stats.bits_sent += len(wire) * 8
        if self.bit_error_rate == 0.0:
            return bytes(wire)

        output = bytearray(wire)
        for byte_index, value in enumerate(output):
            mutated = value
            for bit in range(8):
                if self._rng.random() < self.bit_error_rate:
                    mutated ^= 1 << bit
                    self.stats.bits_flipped += 1
            output[byte_index] = mutated
        return bytes(output)
