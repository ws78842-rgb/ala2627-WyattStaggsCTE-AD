import os
import random
import select
import sys
import time


PITCH_LENGTH = 36
PITCH_INTERVAL = 5
HIT_START = 22
HIT_END = 29
FRAME_DELAY = PITCH_INTERVAL / (PITCH_LENGTH + 1)

if os.name == "nt":
    import msvcrt
else:
    import termios
    import tty


def read_key():
    if os.name == "nt":
        if msvcrt.kbhit():
            return msvcrt.getwch()
    elif select.select([sys.stdin], [], [], 0)[0]:
        return sys.stdin.read(1)
    return None


def pitch():
    terminal_settings = None
    if os.name != "nt" and sys.stdin.isatty():
        terminal_settings = termios.tcgetattr(sys.stdin.fileno())
        tty.setcbreak(sys.stdin.fileno())

    print("\nCPU PITCHER P" + "-" * PITCH_LENGTH + "B BATTER")
    print(" " * (HIT_START + 1) + "[" + "-" * (HIT_END - HIT_START - 1) + "] HIT ZONE")

    swing_position = None
    quit_game = False
    try:
        for position in range(PITCH_LENGTH + 1):
            path = "-" * position + "o" + "-" * (PITCH_LENGTH - position)
            frame = "P" + path + "B"
            if sys.stdout.isatty():
                print("\r" + frame, end="", flush=True)
            else:
                print(frame, flush=True)

            key = read_key()
            if key in ("q", "Q"):
                quit_game = True
                break
            if swing_position is None and key in (" ", "s", "S"):
                swing_position = position

            time.sleep(FRAME_DELAY)
    finally:
        if terminal_settings is not None:
            termios.tcsetattr(sys.stdin.fileno(), termios.TCSADRAIN, terminal_settings)
        print()

    return swing_position, quit_game


def main():
    print("=" * 42)
    print("          DIAMOND PULSE BASEBALL")
    print("=" * 42)
    batter = input("Batter name: ").strip() or "Rookie"
    print("\n" + batter + ", the CPU pitcher throws to you every five seconds.")
    print("Watch the ball travel from pitcher P to batter B.")
    print("Tap SPACE (or S) to swing. Swing in the HIT ZONE to connect.")
    print("Take a pitch, or press Q during a pitch to quit.\n")

    runs = 0
    hits = 0
    outs = 0
    strikes = 0
    balls = 0
    while outs < 3:
        print("Runs: " + str(runs) + " | Hits: " + str(hits) + " | Outs: " + str(outs))
        print("Count: " + str(balls) + " balls, " + str(strikes) + " strikes")
        swing_position, quit_game = pitch()

        if quit_game:
            break

        if swing_position is not None:
            if HIT_START <= swing_position <= HIT_END:
                hits += 1
                if abs(swing_position - (HIT_START + HIT_END) // 2) <= 1:
                    runs += 2
                    print("CRACK! Perfect timing, a home run! Two runs!")
                else:
                    runs += 1
                    print("Solid contact! A base hit and one run!")
                balls = 0
                strikes = 0
            else:
                strikes += 1
                print("Swing and a miss! You were early or late.")
        elif random.random() < 0.65:
            strikes += 1
            print("Called strike!")
        else:
            balls += 1
            print("Ball! The pitch missed the zone.")

        if strikes >= 3:
            outs += 1
            strikes = 0
            balls = 0
            print("Strike three! That's an out.")
        elif balls >= 4:
            balls = 0
            strikes = 0
            print("Four balls! You take your base.")

    print("\nGame over, " + batter + "!")
    print("Final score: " + str(runs) + " runs, " + str(hits) + " hits, " + str(outs) + " outs.")


if __name__ == "__main__":
    main()
