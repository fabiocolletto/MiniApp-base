import {
  getSystemReleaseMetadata as resolveSystemReleaseMetadata,
  getSystemVersion as resolveSystemVersion,
  getSystemVersionLabel as resolveSystemVersionLabel,
} from '../utils/system-release.js';

export function getSystemMetadata() {
  const metadata = resolveSystemReleaseMetadata();
  return {
    version: metadata.version,
    publishedAt: metadata.publishedAt,
    changelogPath: metadata.changelogPath,
  };
}

export function getSystemVersion() {
  return resolveSystemVersion();
}

export function getSystemVersionLabel() {
  return resolveSystemVersionLabel();
}

export function getSystemReleaseDate() {
  return resolveSystemReleaseMetadata().publishedAt;
}

export function getSystemChangelogPath() {
  return resolveSystemReleaseMetadata().changelogPath;
}
